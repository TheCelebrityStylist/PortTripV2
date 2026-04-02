import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import PlanScoreCard from './PlanScoreCard';
import PlanDeltaCard from './PlanDeltaCard';
import PlanVariantSelector from './PlanVariantSelector';
import { scorePlan, explainScore } from '../utils/scoringEngine';
import {
  Sparkles, Loader2, Zap, TrendingDown, Navigation, Utensils,
  Users, Crown, Target, Shield, Check, AlertTriangle, Star,
  ChevronRight, Clock, DollarSign, MapPin, X, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ACTIONS = [
  { id: 'build_full_itinerary', label: 'Build my perfect day', icon: Sparkles, accent: true, desc: 'Full AI itinerary in seconds' },
  { id: 'optimize_route', label: 'Make it smarter', icon: Navigation, desc: 'Optimize stops + routing' },
  { id: 'make_safer', label: 'Maximize safety', icon: Shield, desc: 'Protect your return buffer' },
  { id: 'make_cheaper', label: 'Make it cheaper', icon: TrendingDown, desc: 'Cut costs, keep quality' },
  { id: 'reduce_walking', label: 'Reduce walking', icon: Zap, desc: 'More transport, less feet' },
  { id: 'local_vibe', label: 'More local vibe', icon: Map, desc: 'Off tourist trail, authentic' },
  { id: 'hidden_gem_injection', label: 'Add hidden gem', icon: MapPin, desc: 'One thing tourists never find' },
  { id: 'add_wow_moment', label: 'Add wow moment', icon: Star, desc: 'Elevate the emotional peak' },
  { id: 'add_lunch_nearby', label: 'Best local lunch', icon: Utensils, desc: 'Real restaurant, not tourist trap' },
  { id: 'family_friendly', label: 'Family-friendly', icon: Users, desc: 'Adapt for kids' },
  { id: 'premium_day', label: 'Make it premium', icon: Crown, desc: 'Luxury upgrade' },
  { id: 'beat_ship_excursion_price', label: 'Beat ship price', icon: Target, desc: 'Same day, fraction of cost' },
  { id: 'shorten_plan', label: 'Shorten this plan', icon: Zap, desc: 'Best 3–4 stops if time is short' },
  { id: 'expand_plan', label: 'Expand this plan', icon: Sparkles, desc: 'Fill all available time' },
];

function SafeReturnBadge({ score }) {
  if (!score) return null;
  const color = score >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : score >= 50 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    : 'text-red-400 bg-red-400/10 border-red-400/20';
  const icon = score >= 80 ? <Shield className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />;
  return (
    <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', color)}>
      {icon} {score}% safe return
    </span>
  );
}

function StopWorthIt({ stop }) {
  if (!stop.worthItScore && !stop.touristTrapRisk) return null;
  const score = stop.worthItScore || stop.stopScore;
  const trapColor = stop.touristTrapRisk === 'high' ? 'text-red-400' : stop.touristTrapRisk === 'medium' ? 'text-yellow-400' : 'text-green-400';
  return (
    <div className="flex items-center gap-2 mt-1 flex-wrap">
      {score > 0 && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
          score >= 80 ? 'text-green-400 border-green-400/20 bg-green-400/8' :
          score >= 60 ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/8' :
          'text-muted-foreground border-border/20 bg-secondary'
        }`}>
          Worth-it {score}
        </span>
      )}
      {stop.touristTrapRisk && stop.touristTrapRisk !== 'low' && (
        <span className={`text-[9px] font-bold ${trapColor}`}>
          {stop.touristTrapRisk === 'high' ? '⚠ Tourist trap risk' : '~ Moderate crowds'}
        </span>
      )}
    </div>
  );
}

function PlanSummaryBar({ result, plan }) {
  if (!result) return null;
  const saving = result.savingsVsShipExcursion || (plan?.ship_excursion_price - result.totalEstimatedCost);
  return (
    <div className="rounded-xl border border-border/30 bg-card/60 p-3 space-y-2">
      {result.summary && (
        <p className="text-xs text-foreground font-semibold leading-snug">{result.summary}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {result.totalEstimatedCost > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <DollarSign className="w-3 h-3" />€{result.totalEstimatedCost}/person
          </span>
        )}
        {saving > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
            <TrendingDown className="w-3 h-3" />Save €{saving} vs ship
          </span>
        )}
        {result.recommendedReturnStartTime && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />Leave by {result.recommendedReturnStartTime}
          </span>
        )}
        <SafeReturnBadge score={result.safeReturnScore} />
      </div>
    </div>
  );
}

function StopCard({ stop, transportLeg, onAccept, accepted }) {
  if (!stop || stop.type === 'transit') return null;
  const typeColors = {
    arrival: 'text-accent', departure: 'text-accent', food: 'text-orange-400',
    attraction: 'text-foreground', viewpoint: 'text-blue-400', shopping: 'text-purple-400',
    return: 'text-yellow-400',
  };
  const typeEmoji = { arrival: '⚓', departure: '🚢', food: '🍽️', attraction: '📍', viewpoint: '🌅', shopping: '🛍️', return: '🔙' };

  return (
    <div className="space-y-1">
      {transportLeg && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/10">
          <Navigation className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">
            {transportLeg.mode} · {transportLeg.durationMin || transportLeg.durationMinutes}min
            {(transportLeg.estimatedCostEur || transportLeg.estimatedCost) > 0
              ? ` · €${transportLeg.estimatedCostEur || transportLeg.estimatedCost}` : ' · free'}
          </span>
          {transportLeg.notes && <span className="text-[10px] text-muted-foreground/50 truncate hidden sm:block">— {transportLeg.notes}</span>}
        </div>
      )}
      <div className={cn(
        'rounded-xl border p-3 transition-all',
        accepted ? 'border-green-400/25 bg-green-400/5' : 'border-border/30 bg-card/60 hover:border-accent/20'
      )}>
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-0.5">{typeEmoji[stop.type] || '📍'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-xs font-bold leading-tight', typeColors[stop.type] || 'text-foreground')}>
                {stop.title}
                {stop.priority === 'must' && <span className="ml-1 text-[9px] text-accent font-black">MUST</span>}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {stop.startTime && <span className="text-[10px] text-muted-foreground/60 tabular-nums">{stop.startTime}</span>}
                <button
                  onClick={() => onAccept(stop)}
                  disabled={accepted}
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
                    accepted ? 'bg-green-400/20 text-green-400' : 'bg-accent/15 text-accent hover:bg-accent/30'
                  )}
                >
                  {accepted ? <Check className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {(stop.durationMin || stop.durationMinutes) > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{stop.durationMin || stop.durationMinutes}min
                </span>
              )}
              {(stop.estimatedCostEur || stop.estimatedCost) > 0 && (
                <span className="text-[10px] text-muted-foreground">€{stop.estimatedCostEur || stop.estimatedCost}</span>
              )}
              {stop.rating > 0 && (
                <span className="text-[10px] text-yellow-400 font-bold">⭐{stop.rating}</span>
              )}
              {stop.locationName && (
                <span className="text-[10px] text-muted-foreground/50 truncate flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{stop.locationName}
                </span>
              )}
            </div>

            {(stop.why || stop.reasonWhyWorthIt) && (
              <p className="text-[10px] text-muted-foreground/70 mt-1 leading-snug line-clamp-2">{stop.why || stop.reasonWhyWorthIt}</p>
            )}
            {stop.insiderTip && (
              <p className="text-[10px] text-accent/80 mt-1 leading-snug">
                <span className="font-bold">Tip:</span> {stop.insiderTip}
              </p>
            )}
            <StopWorthIt stop={stop} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupPlanCard({ items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-2">Backup Plan</p>
      <div className="space-y-1.5">
        {items.map((b, i) => (
          <div key={i} className="space-y-0.5">
            <p className="text-[10px] font-bold text-yellow-400/80">{b.trigger}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">{b.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlannerAiPanel({ plan, blocks, cruisePort, onApplyPlan, onAcceptStop, planVariants, selectedVariant, onSelectVariant }) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [acceptedStops, setAcceptedStops] = useState(new Set());

  const hasExistingPlan = blocks?.length > 0;

  const runAction = useCallback(async (actionId) => {
    if (!plan?.port_city) {
      toast.error('Set up your port first');
      return;
    }
    setLoading(true);
    setActiveAction(actionId);
    setResult(null);
    setAcceptedStops(new Set());

    const currentPlanData = hasExistingPlan ? {
      stops: blocks.filter(b => b.block_type !== 'transit').map(b => ({
        id: b.id, title: b.title, type: b.block_type,
        startTime: b.start_time ? new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        durationMinutes: b.duration_minutes, estimatedCost: b.cost_estimate,
        locationName: b.location,
      })),
    } : null;

    try {
      const res = await base44.functions.invoke('plannerEngine', {
        action: actionId,
        plan,
        currentPlanData: actionId === 'build_full_itinerary' ? null : currentPlanData,
        portGuideData: cruisePort ? {
          transport_port_to_city: cruisePort.transport_port_to_city,
          transport_within_city: cruisePort.transport_within_city,
          attraction_highlights: cruisePort.attraction_highlights,
          local_food: cruisePort.local_food,
          safety_security: cruisePort.safety_security,
          unique_experiences: cruisePort.unique_experiences,
          port_address: cruisePort.port_address,
        } : null,
      });
      if (res?.data?.plan) {
        setResult(res.data.plan);
      } else {
        toast.error('Planning engine returned no result');
      }
    } catch (e) {
      toast.error('Planning engine error: ' + e.message);
    }
    setLoading(false);
  }, [plan, blocks, cruisePort, hasExistingPlan]);

  const handleAcceptStop = useCallback((stop) => {
    onAcceptStop({
      block_type: stop.type === 'food' ? 'stop' : stop.type === 'transit' ? 'transit' : stop.type === 'arrival' ? 'arrival' : stop.type === 'return' || stop.type === 'departure' ? 'departure' : 'stop',
      title: stop.title,
      subtitle: stop.subtitle || stop.locationName || '',
      location: stop.address || stop.subtitle || stop.locationName || '',
      duration_minutes: stop.durationMin || stop.durationMinutes || 60,
      cost_estimate: stop.estimatedCostEur || stop.estimatedCost || 0,
      notes: stop.why || stop.reasonWhyWorthIt || '',
      insider_tip: stop.insiderTip || '',
      google_maps_query: stop.locationName ? `${stop.title} ${plan?.port_city}` : '',
    });
    setAcceptedStops(prev => new Set([...prev, stop.id]));
    toast.success(`Added: ${stop.title}`);
  }, [onAcceptStop, plan?.port_city]);

  const handleApplyAll = useCallback(() => {
    if (!onApplyPlan) return;
    const count = result?.journey?.filter(j => j.type === 'stop').length || result?.stops?.length || 0;
    onApplyPlan(result);
    toast.success(`Applied ${count} stops + route`);
  }, [result, onApplyPlan]);

  const transportMap = {};
  if (result?.transportLegs) {
    for (const leg of result.transportLegs) {
      transportMap[leg.toStopId] = leg;
    }
  }

  return (
    <div className="flex flex-col h-full bg-background/98 border-l border-border/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground">Planning Engine</p>
            <p className="text-[10px] text-muted-foreground">
              {plan?.port_city ? `${plan.port_city} · All-aboard ${plan.all_aboard_time}` : 'Set up a port to begin'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">

          {/* Variant selector */}
          {planVariants?.length > 0 && (
            <PlanVariantSelector
              plans={planVariants}
              selected={selectedVariant}
              onSelect={onSelectVariant}
            />
          )}

          {/* Action buttons */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Planning Actions</p>
            <div className="space-y-1.5">
              {ACTIONS.map(({ id, label, icon: Icon, accent, desc }) => (
                <button
                  key={id}
                  onClick={() => runAction(id)}
                  disabled={loading}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left',
                    activeAction === id && loading
                      ? 'border-accent/50 bg-accent/10'
                      : accent
                      ? 'border-accent/30 bg-accent/8 hover:bg-accent/15 hover:border-accent/50'
                      : 'border-border/30 bg-card/40 hover:bg-card/80 hover:border-accent/20',
                    loading && activeAction !== id && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    accent ? 'bg-accent/20' : 'bg-secondary')}>
                    {loading && activeAction === id
                      ? <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                      : <Icon className={cn('w-3.5 h-3.5', accent ? 'text-accent' : 'text-muted-foreground')} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-bold', accent ? 'text-accent' : 'text-foreground')}>{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  {!loading && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-3 border-t border-border/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">Result</p>
                <div className="flex items-center gap-2">
                  {onApplyPlan && result.stops?.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleApplyAll}
                      className="h-7 text-[11px] bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-3 font-bold gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Apply all
                    </Button>
                  )}
                  <button onClick={() => setResult(null)} className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <PlanSummaryBar result={result} plan={plan} />

              {(() => {
                const { planScore, scoreBreakdown } = scorePlan(result, {
                  dockTime: plan?.dock_time || '08:00',
                  allAboard: plan?.all_aboard_time || '17:00',
                  bufferMins: (plan?.buffer_minutes || 90) + (plan?.tender_delay_minutes || 0),
                  diyBudget: plan?.diy_budget || 60,
                  shipExcursionPrice: plan?.ship_excursion_price || 119,
                  travelMode: plan?.travel_mode,
                });
                const explanation = result.scoreExplanation || explainScore(scoreBreakdown, planScore);
                return (
                  <>
                    <PlanScoreCard
                      planScore={planScore}
                      scoreBreakdown={scoreBreakdown}
                      scoreExplanation={explanation}
                      optimizationMode={result.optimizationMode}
                    />
                    {activeAction !== 'build_full_itinerary' && (
                      <PlanDeltaCard delta={result.beforeAfterDelta} />
                    )}
                  </>
                );
              })()}

              {/* Show journey items if available, else stops */}
              {(result.journey || result.stops?.map(s => ({ ...s, type: s.type || 'stop' })) || []).filter(j => j.type !== 'arrival' && j.type !== 'departure').map((item) => (
                item.type === 'transport' ? (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/10">
                    <span className="text-[10px] font-semibold text-muted-foreground/70 truncate">{item.title}</span>
                    {item.durationMin > 0 && <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">{item.durationMin}m</span>}
                    {item.estimatedCostEur > 0 && <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">€{item.estimatedCostEur}</span>}
                  </div>
                ) : (
                  <StopCard
                    key={item.id}
                    stop={item}
                    transportLeg={transportMap[item.id]}
                    onAccept={handleAcceptStop}
                    accepted={acceptedStops.has(item.id)}
                  />
                )
              ))}

              <BackupPlanCard items={result.backupPlan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}