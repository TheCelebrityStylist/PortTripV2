import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Shield, Clock, TrendingDown, Navigation, Star, Zap, MapPin, Route,
  ChevronDown, ChevronUp, Check, AlertTriangle, Lightbulb, Sparkles,
  Heart, Target, DollarSign, Footprints, Coffee, Crown, Eye, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { scorePlan, getPlanBadges } from '../utils/scoringEngine';

// ── PERSONALITY CHIP CONFIG ──────────────────────────────────────────────────
const PERSONALITY = {
  iconic_day:     { label: 'Iconic Day',      color: 'text-accent border-accent/30 bg-accent/8' },
  local_flavor:   { label: 'Local Flavor',    color: 'text-purple-400 border-purple-400/30 bg-purple-400/8' },
  stress_free:    { label: 'Stress-Free',     color: 'text-blue-400 border-blue-400/30 bg-blue-400/8' },
  efficient:      { label: 'Efficient Route', color: 'text-green-400 border-green-400/30 bg-green-400/8' },
  low_walking:    { label: 'Low Walking',     color: 'text-orange-400 border-orange-400/30 bg-orange-400/8' },
  premium_day:    { label: 'Premium Day',     color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/8' },
  best_value:     { label: 'Best Value',      color: 'text-green-400 border-green-400/30 bg-green-400/8' },
  family_easy:    { label: 'Family Easy',     color: 'text-blue-400 border-blue-400/30 bg-blue-400/8' },
  hidden_gems:    { label: 'Hidden Gem Boost',color: 'text-purple-400 border-purple-400/30 bg-purple-400/8' },
};

const EMOTIONAL_PHASES = [
  { key: 'calm_start',      label: 'Settle In',     icon: Coffee,  color: 'text-blue-400' },
  { key: 'wow_peak',        label: 'Wow Moment',    icon: Star,    color: 'text-yellow-400' },
  { key: 'recharge',        label: 'Recharge',      icon: Coffee,  color: 'text-green-400' },
  { key: 'final_memory',    label: 'Final Memory',  icon: Heart,   color: 'text-pink-400' },
  { key: 'wind_down',       label: 'Wind Down',     icon: Shield,  color: 'text-accent' },
];

function ScoreRing({ score, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#facc15' : '#f87171';
  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeWidth="8" fill="none" className="text-border/15" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - fill }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-lg font-black tabular-nums leading-none" style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}>
          {score}
        </motion.span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">score</span>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color = 'text-foreground', highlight }) {
  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border',
      highlight ? 'border-accent/30 bg-accent/8' : 'border-border/20 bg-card/40')}>
      <Icon className={cn('w-3 h-3 flex-shrink-0', highlight ? 'text-accent' : 'text-muted-foreground')} />
      <div>
        <p className={cn('text-xs font-black tabular-nums leading-none', color)}>{value}</p>
        <p className="text-[8px] text-muted-foreground uppercase tracking-wide font-bold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SafetyBar({ score }) {
  const color = score >= 85 ? '#34d399' : score >= 65 ? '#facc15' : '#f87171';
  const label = score >= 85 ? 'Safe Return' : score >= 65 ? 'Moderate Risk' : 'Tight Timing';
  const Icon = score >= 85 ? Shield : AlertTriangle;
  return (
    <div className="flex items-center gap-3 bg-card/40 rounded-xl border border-border/20 px-3 py-2">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
          <span className="text-[10px] font-black tabular-nums" style={{ color }}>{score}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-border/20 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

function EmotionalArc({ arc }) {
  if (!arc) return null;
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Emotional Arc</p>
      <div className="relative">
        {/* Arc line */}
        <div className="flex items-end gap-1 h-8 mb-2">
          {[2, 4, 6, 5, 2].map((h, i) => (
            <motion.div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-accent/20 to-accent/60"
              style={{ height: `${h * 8}px` }}
              initial={{ height: 0 }} animate={{ height: `${h * 8}px` }} transition={{ delay: i * 0.1, duration: 0.6 }} />
          ))}
        </div>
        <div className="flex gap-1">
          {EMOTIONAL_PHASES.map(phase => {
            const text = arc[phase.key];
            if (!text) return null;
            const Icon = phase.icon;
            return (
              <div key={phase.key} className="flex-1 text-center">
                <Icon className={cn('w-2.5 h-2.5 mx-auto mb-0.5', phase.color)} />
                <p className="text-[7px] text-muted-foreground leading-tight line-clamp-2">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IntelligenceRow({ icon: Icon, label, value, color = 'text-muted-foreground', accent }) {
  if (!value) return null;
  return (
    <div className={cn('flex items-start gap-2.5 px-3 py-2 rounded-xl', accent ? 'bg-accent/6 border border-accent/12' : 'bg-card/30 border border-border/12')}>
      <Icon className={cn('w-3 h-3 flex-shrink-0 mt-0.5', accent ? 'text-accent' : color)} />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wide text-muted-foreground/60 mb-0.5">{label}</p>
        <p className="text-[11px] text-foreground/90 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function WowMomentCard({ wow }) {
  if (!wow) return null;
  return (
    <div className="rounded-xl border border-yellow-400/25 bg-gradient-to-br from-yellow-400/8 to-orange-400/5 p-3">
      <div className="flex items-start gap-2">
        <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-1">✦ Wow Moment</p>
          <p className="text-xs font-bold text-foreground leading-tight">{wow.title}</p>
          {wow.why && <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{wow.why}</p>}
          {wow.bestTiming && (
            <p className="text-[10px] text-yellow-400/80 mt-1 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />Best at: {wow.bestTiming}
            </p>
          )}
          {wow.backup && (
            <p className="text-[10px] text-muted-foreground/50 mt-1 border-t border-border/10 pt-1">
              Backup: {wow.backup}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ConciergeInsight({ insights }) {
  if (!insights) return null;
  const items = [
    { label: 'Pre-book', value: insights.mustPreBook, icon: Target, color: 'text-accent' },
    { label: 'Skip entirely', value: insights.skipEntirely, icon: Zap, color: 'text-muted-foreground' },
    { label: 'Biggest time saver', value: insights.biggestTimeSaver, icon: Clock, color: 'text-green-400' },
    { label: 'Smart spend', value: insights.whereToSplurge, icon: Crown, color: 'text-yellow-400' },
    { label: 'Tourist mistake', value: insights.touristMistake, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Lunch strategy', value: insights.lunchStrategy, icon: Coffee, color: 'text-orange-400' },
  ].filter(i => i.value);
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Concierge Intelligence</p>
      {items.map(item => (
        <div key={item.label} className="flex items-start gap-2 text-[10px]">
          <item.icon className={cn('w-2.5 h-2.5 flex-shrink-0 mt-0.5', item.color)} />
          <span className="text-muted-foreground"><span className="font-bold text-foreground/80">{item.label}:</span> {item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlanHeroSummary({ plan, blocks, planResult }) {
  const [expanded, setExpanded] = useState(false);
  if (!plan) return null;

  const planConfig = {
    dockTime: plan.dock_time || '08:00',
    allAboard: plan.all_aboard_time || '17:00',
    bufferMins: (plan.buffer_minutes || 90) + (plan.tender_delay_minutes || 0),
    diyBudget: plan.diy_budget || 60,
    shipExcursionPrice: plan.ship_excursion_price || 119,
    travelMode: plan.travel_mode,
  };

  const { planScore, scoreBreakdown } = scorePlan(planResult || {}, planConfig);
  const badges = getPlanBadges(scoreBreakdown, planScore);

  const totalCost = planResult?.totalEstimatedCost || blocks?.reduce((s, b) => s + (b.cost_estimate || 0), 0) || 0;
  const savings = planResult?.savingsVsShipExcursion || (plan.ship_excursion_price > 0 ? plan.ship_excursion_price - totalCost : null);
  const safeScore = planResult?.safeReturnScore || scoreBreakdown?.cruiseSafety || 80;
  const walkMins = planResult?.totalWalkingMinutes;
  const transportMins = planResult?.totalTransportMinutes;
  const sightMins = planResult?.totalSightseeingMinutes;
  const returnTime = planResult?.recommendedReturnStartTime;
  const planName = planResult?.planName || `${plan.port_city} — Smart Day`;
  const summary = planResult?.summary || '';
  const personalities = planResult?.planPersonality || [];
  const wowMoment = planResult?.wowMoment;
  const emotionalArc = planResult?.emotionalArc;
  const concierge = planResult?.conciergeInsights;
  const whyThisWorks = planResult?.whyThisPlanWorks || [];
  const routeRationale = planResult?.routeRationale;

  const stopCount = blocks?.filter(b => b.block_type === 'stop').length || 0;
  const hasContent = stopCount > 0 || planResult;
  if (!hasContent) return null;

  const scoreColor = planScore >= 80 ? 'text-green-400' : planScore >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-6 border border-border/30 shadow-xl shadow-black/20"
    >
      {/* Top gradient strip */}
      <div className="h-0.5 bg-gradient-to-r from-accent via-blue-400/60 to-purple-400/40" />

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-card/90 via-card/70 to-background/60 p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={planScore} />

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-foreground leading-tight mb-0.5">{planName}</h2>
            {summary && <p className="text-[11px] text-muted-foreground leading-snug mb-2 line-clamp-2">{summary}</p>}

            {/* Personality chips */}
            <div className="flex flex-wrap gap-1">
              {personalities.map(p => {
                const cfg = PERSONALITY[p] || PERSONALITY.iconic_day;
                return (
                  <span key={p} className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border', cfg.color)}>
                    {cfg.label}
                  </span>
                );
              })}
              {personalities.length === 0 && badges.slice(0, 3).map(b => (
                <span key={b.label} className="text-[9px] font-black px-2 py-0.5 rounded-full border text-accent border-accent/30 bg-accent/8">
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <button onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 hover:bg-secondary transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>

        {/* Stats grid */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {totalCost > 0 && <StatPill icon={DollarSign} label="Total cost" value={`€${totalCost}`} />}
          {savings > 0 && <StatPill icon={TrendingDown} label="Saved vs ship" value={`€${Math.round(savings)}`} color="text-green-400" highlight />}
          {walkMins > 0 && <StatPill icon={Footprints} label="Walking" value={`${walkMins}m`} />}
          {transportMins > 0 && <StatPill icon={Navigation} label="Transport" value={`${transportMins}m`} />}
          {sightMins > 0 && <StatPill icon={Eye} label="Sightseeing" value={`${sightMins}m`} />}
          {returnTime && <StatPill icon={Clock} label="Leave by" value={returnTime} color="text-yellow-400" />}
        </div>

        {/* Safety bar */}
        <div className="mt-3">
          <SafetyBar score={safeScore} />
        </div>

        {/* Why it works */}
        {whyThisWorks.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {whyThisWorks.slice(0, 3).map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                <div className="w-3.5 h-3.5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2 h-2 text-accent" />
                </div>
                <span className="leading-snug">{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXPANDED INTELLIGENCE */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/15 bg-background/40 p-5 space-y-4">

              {/* Wow moment */}
              {wowMoment && <WowMomentCard wow={wowMoment} />}

              {/* Route logic */}
              {routeRationale && (
                <IntelligenceRow icon={Route} label="Route Logic" value={routeRationale} accent />
              )}

              {/* Emotional arc */}
              {emotionalArc && <EmotionalArc arc={emotionalArc} />}

              {/* Score breakdown */}
              {scoreBreakdown && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">Score Breakdown</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {[
                      ['Cruise Safety', 'cruiseSafety'],
                      ['Route Logic', 'routeLogic'],
                      ['Sightseeing', 'sightseeingValue'],
                      ['Cost Efficiency', 'costEfficiency'],
                      ['Time Efficiency', 'timeEfficiency'],
                      ['Local Character', 'localCharacter'],
                    ].map(([label, key]) => {
                      const v = scoreBreakdown[key] || 0;
                      if (!v) return null;
                      const c = v >= 80 ? '#34d399' : v >= 60 ? '#facc15' : '#f87171';
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: c }}>{v}</span>
                          </div>
                          <div className="h-1 rounded-full bg-border/20 overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ background: c }}
                              initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Concierge intelligence */}
              {concierge && <ConciergeInsight insights={concierge} />}

              {/* Fastest improvement */}
              {planResult?.fastestImprovement && (
                <div className="flex items-start gap-2 bg-yellow-400/6 border border-yellow-400/15 rounded-xl px-3 py-2.5">
                  <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-snug">
                    <span className="font-bold text-yellow-400">Fastest improvement: </span>
                    <span className="text-muted-foreground">{planResult.fastestImprovement}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}