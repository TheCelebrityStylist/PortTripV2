/**
 * Deterministic scoring engine for PortTrip itineraries.
 * Works on any plan object (AI-returned or locally stored).
 * All scores: 0–100.
 */

function timeToMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

// ─── Sub-score calculators ──────────────────────────────────────────────────

export function scoreTimeEfficiency(stops, transportLegs, dockTime = '08:00', allAboard = '17:00') {
  if (!stops?.length) return 50;
  const totalMins = timeToMins(allAboard) - timeToMins(dockTime);
  if (totalMins <= 0) return 50;

  const totalTransport = (transportLegs || []).reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalSightseeing = stops.filter(s => s.type !== 'transit' && s.type !== 'arrival' && s.type !== 'return')
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  const transportRatio = totalTransport / totalMins;
  const usageRatio = (totalTransport + totalSightseeing) / totalMins;

  // Penalize if transport > 35% of the day
  let score = 100;
  if (transportRatio > 0.35) score -= (transportRatio - 0.35) * 200;
  // Reward high productive time usage (80%+ of day used well)
  if (usageRatio < 0.7) score -= (0.7 - usageRatio) * 80;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreCruiseSafety(stops, transportLegs, allAboard = '17:00', bufferMins = 90) {
  if (!stops?.length) return 75;
  const allAboardMins = timeToMins(allAboard);
  const mustLeaveBy = allAboardMins - bufferMins;

  // Find the last non-return stop
  const nonReturnStops = stops.filter(s => s.type !== 'return' && s.type !== 'departure');
  const lastStop = nonReturnStops[nonReturnStops.length - 1];
  if (!lastStop?.endTime) return 75;

  const lastEndMins = timeToMins(lastStop.endTime);
  const bufferLeft = mustLeaveBy - lastEndMins;

  let score = 100;
  if (bufferLeft < 0) score = Math.max(0, 20 + (bufferLeft / 5)); // critically unsafe
  else if (bufferLeft < 15) score = 55 + (bufferLeft * 3);
  else if (bufferLeft < 30) score = 75 + (bufferLeft * 0.5);
  // penalize risky transport (late-day flights/ferries)
  const lateRiskyLegs = (transportLegs || []).filter(l => {
    const legEndMins = timeToMins(l.endTime);
    return (l.mode === 'ferry' || l.mode === 'train') && legEndMins > mustLeaveBy - 30;
  });
  score -= lateRiskyLegs.length * 8;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreSightseeingValue(stops, travelMode = 'first_time') {
  if (!stops?.length) return 50;
  const sightseeingStops = stops.filter(s => ['attraction', 'viewpoint', 'food', 'shopping'].includes(s.type));
  if (!sightseeingStops.length) return 40;

  let score = 60;

  // More stops = better (up to 6)
  score += Math.min(sightseeingStops.length, 6) * 4;

  // must-see density
  const mustCount = sightseeingStops.filter(s => s.priority === 'must').length;
  score += mustCount * 5;

  // Average worthItScore from AI if present
  const withScores = sightseeingStops.filter(s => s.worthItScore > 0);
  if (withScores.length) {
    const avgWorth = withScores.reduce((sum, s) => sum + s.worthItScore, 0) / withScores.length;
    score = (score + avgWorth) / 2;
  }

  // Food stop present
  if (stops.some(s => s.type === 'food')) score += 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreCostEfficiency(stops, transportLegs, diyBudget = 60, shipExcursionPrice = 119) {
  if (!stops?.length) return 60;
  const totalCost = [
    ...(stops || []).map(s => s.estimatedCost || 0),
    ...(transportLegs || []).map(l => l.estimatedCost || 0),
  ].reduce((sum, c) => sum + c, 0);

  if (totalCost === 0) return 70;

  const savings = shipExcursionPrice - totalCost;
  let score = 60;

  // Big savings = high score
  if (savings > 0) score += Math.min(35, (savings / shipExcursionPrice) * 70);
  else score -= Math.min(40, (-savings / shipExcursionPrice) * 60);

  // Under budget bonus
  if (totalCost <= diyBudget) score += 5;
  else score -= Math.min(15, ((totalCost - diyBudget) / diyBudget) * 30);

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreWalkingComfort(stops, transportLegs) {
  const walkLegs = (transportLegs || []).filter(l => l.mode === 'walk');
  const totalWalk = walkLegs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  let score = 100;
  // Penalize >60min total walking
  if (totalWalk > 60) score -= Math.min(50, (totalWalk - 60) * 1.5);
  // Penalize long single walk legs > 20min
  const longWalks = walkLegs.filter(l => l.durationMinutes > 20).length;
  score -= longWalks * 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreRouteLogic(stops, transportLegs) {
  if (!stops?.length) return 60;
  let score = 80;

  // Penalize many mode-switches (sign of chaotic routing)
  const modes = (transportLegs || []).map(l => l.mode);
  let switches = 0;
  for (let i = 1; i < modes.length; i++) if (modes[i] !== modes[i - 1]) switches++;
  score -= Math.min(20, switches * 4);

  // Reward if stops are geographically clustered (use locationName as proxy)
  const uniqueLocations = new Set(stops.map(s => s.locationName?.split(',')[0]).filter(Boolean));
  if (uniqueLocations.size <= 3) score += 10;
  else if (uniqueLocations.size > 6) score -= 15;

  return Math.min(100, Math.max(0, Math.round(score)));
}

// ─── Master score ───────────────────────────────────────────────────────────

export function computePlanScore(breakdown) {
  if (!breakdown) return 0;
  const {
    timeEfficiency = 50, cruiseSafety = 50, sightseeingValue = 50,
    costEfficiency = 50, walkingComfort = 50, routeLogic = 50,
  } = breakdown;
  return Math.round(
    timeEfficiency * 0.20 +
    cruiseSafety * 0.25 +
    sightseeingValue * 0.25 +
    costEfficiency * 0.10 +
    walkingComfort * 0.10 +
    routeLogic * 0.10
  );
}

// ─── Full plan scoring ──────────────────────────────────────────────────────

export function scorePlan(planResult, planConfig = {}) {
  const stops = planResult?.stops || [];
  const legs = planResult?.transportLegs || [];
  const { dockTime, allAboard, bufferMins, diyBudget, shipExcursionPrice, travelMode } = planConfig;

  const breakdown = {
    timeEfficiency: planResult?.scoreBreakdown?.timeEfficiency ?? scoreTimeEfficiency(stops, legs, dockTime, allAboard),
    cruiseSafety: planResult?.scoreBreakdown?.cruiseSafety ?? scoreCruiseSafety(stops, legs, allAboard, bufferMins),
    sightseeingValue: planResult?.scoreBreakdown?.sightseeingValue ?? scoreSightseeingValue(stops, travelMode),
    costEfficiency: planResult?.scoreBreakdown?.costEfficiency ?? scoreCostEfficiency(stops, legs, diyBudget, shipExcursionPrice),
    walkingComfort: planResult?.scoreBreakdown?.walkingComfort ?? scoreWalkingComfort(stops, legs),
    routeLogic: planResult?.scoreBreakdown?.routeLogic ?? scoreRouteLogic(stops, legs),
  };

  const planScore = planResult?.planScore ?? computePlanScore(breakdown);

  return { planScore, scoreBreakdown: breakdown };
}

// ─── Score explanation ──────────────────────────────────────────────────────

export function explainScore(breakdown, planScore) {
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (breakdown.cruiseSafety >= 85) strengths.push('Strong return buffer — very safe timeline');
  else if (breakdown.cruiseSafety < 60) { weaknesses.push('Return buffer is tight — risk of missing the ship'); suggestions.push('Shorten the last stop or leave 15min earlier'); }

  if (breakdown.timeEfficiency >= 80) strengths.push('Excellent use of available port time');
  else if (breakdown.timeEfficiency < 55) { weaknesses.push('Too much time spent in transit'); suggestions.push('Cluster stops geographically to cut transport time'); }

  if (breakdown.sightseeingValue >= 80) strengths.push('High-value sightseeing with must-see stops');
  else if (breakdown.sightseeingValue < 55) { weaknesses.push('Sightseeing value is below average'); suggestions.push('Replace lower-priority stops with must-see highlights'); }

  if (breakdown.costEfficiency >= 80) strengths.push('Excellent savings vs ship excursion');
  else if (breakdown.costEfficiency < 50) { weaknesses.push('Cost is high relative to ship excursion savings'); suggestions.push('Swap one paid attraction for a free alternative'); }

  if (breakdown.walkingComfort >= 80) strengths.push('Comfortable walking load throughout the day');
  else if (breakdown.walkingComfort < 55) { weaknesses.push('Heavy walking — may be tiring'); suggestions.push('Replace walking legs with a taxi or metro'); }

  if (breakdown.routeLogic >= 80) strengths.push('Efficient stop ordering with minimal backtracking');
  else if (breakdown.routeLogic < 55) { weaknesses.push('Route has some backtracking'); suggestions.push('Reorder stops to cluster nearby locations together'); }

  return { strengths, weaknesses, improvementSuggestions: suggestions };
}

// ─── Badges ─────────────────────────────────────────────────────────────────

export function getPlanBadges(breakdown, planScore) {
  const badges = [];
  if (breakdown.cruiseSafety >= 88) badges.push({ label: 'Cruise-safe', color: 'green' });
  if (breakdown.costEfficiency >= 80) badges.push({ label: 'Best value', color: 'cyan' });
  if (breakdown.walkingComfort >= 80) badges.push({ label: 'Low walking', color: 'blue' });
  if (breakdown.sightseeingValue >= 85) badges.push({ label: 'High-value day', color: 'purple' });
  if (breakdown.routeLogic >= 85) badges.push({ label: 'Efficient route', color: 'orange' });
  if (planScore >= 85) badges.push({ label: 'Premium plan', color: 'accent' });
  return badges;
}