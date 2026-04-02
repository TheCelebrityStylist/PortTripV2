/**
 * PlanVariantSelector — premium plan comparison, choose between materially different routes.
 */
import { motion } from 'framer-motion';
import { Star, TrendingDown, Shield, Map, Footprints, Zap, Check, Clock, DollarSign, Navigation, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANT_CONFIG = {
  best_overall:  { icon: Star,         label: 'Best Overall',    tagline: 'Balanced, iconic, efficient',          color: 'accent',  emoji: '⭐' },
  best_value:    { icon: TrendingDown, label: 'Savvy Saver',     tagline: 'More walking, less spend',             color: 'green',   emoji: '💰' },
  least_stress:  { icon: Shield,       label: 'Relaxed & Easy',  tagline: 'Fewer moves, simple route',            color: 'blue',    emoji: '🛡️' },
  local_vibe:    { icon: Map,          label: 'Local Vibe',      tagline: 'Off the tourist trail',                color: 'purple',  emoji: '🗺️' },
  low_walking:   { icon: Footprints,   label: 'Low Effort',      tagline: 'Transport over walking',               color: 'orange',  emoji: '🚌' },
  max_sights:    { icon: Zap,          label: 'Maximum Day',     tagline: 'Every minute counts',                  color: 'cyan',    emoji: '⚡' },
};

const COLORS = {
  accent:  { ring: 'ring-1 ring-accent/40', border: 'border-accent/35', bg: 'bg-accent/6', score: 'text-accent', icon: 'text-accent bg-accent/15', tag: 'bg-accent/12 text-accent' },
  green:   { ring: 'ring-1 ring-green-400/35', border: 'border-green-400/30', bg: 'bg-green-400/5', score: 'text-green-400', icon: 'text-green-400 bg-green-400/15', tag: 'bg-green-400/12 text-green-400' },
  blue:    { ring: 'ring-1 ring-blue-400/35', border: 'border-blue-400/30', bg: 'bg-blue-400/5', score: 'text-blue-400', icon: 'text-blue-400 bg-blue-400/15', tag: 'bg-blue-400/12 text-blue-400' },
  purple:  { ring: 'ring-1 ring-purple-400/35', border: 'border-purple-400/30', bg: 'bg-purple-400/5', score: 'text-purple-400', icon: 'text-purple-400 bg-purple-400/15', tag: 'bg-purple-400/12 text-purple-400' },
  orange:  { ring: 'ring-1 ring-orange-400/35', border: 'border-orange-400/30', bg: 'bg-orange-400/5', score: 'text-orange-400', icon: 'text-orange-400 bg-orange-400/15', tag: 'bg-orange-400/12 text-orange-400' },
  cyan:    { ring: 'ring-1 ring-cyan-400/35', border: 'border-cyan-400/30', bg: 'bg-cyan-400/5', score: 'text-cyan-400', icon: 'text-cyan-400 bg-cyan-400/15', tag: 'bg-cyan-400/12 text-cyan-400' },
};

function ScoreDot({ score, color }) {
  const dotColor = score >= 80 ? '#34d399' : score >= 60 ? '#facc15' : '#f87171';
  const size = 32;
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeWidth="3" fill="none" className="text-border/15" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={dotColor} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - fill }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-black" style={{ color: dotColor }}>{score}</span>
      </div>
    </div>
  );
}

export default function PlanVariantSelector({ plans, selected, onSelect }) {
  if (!plans?.length) return null;

  return (
    <div className="mb-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">
        {plans.length} Route Strategies — pick yours
      </p>
      <div className="space-y-2">
        {plans.map((plan, i) => {
          const cfg = VARIANT_CONFIG[plan.variantType] || VARIANT_CONFIG.best_overall;
          const colors = COLORS[cfg.color] || COLORS.accent;
          const isSelected = selected?.variantType === plan.variantType;
          const Icon = cfg.icon;
          const score = plan.planScore || 75;

          return (
            <motion.button
              key={plan.variantType || i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(plan)}
              className={cn(
                'w-full text-left rounded-2xl border transition-all overflow-hidden',
                isSelected ? `${colors.ring} ${colors.border} ${colors.bg}` : 'border-border/20 bg-card/30 hover:border-border/40 hover:bg-card/50'
              )}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', colors.icon)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn('text-[11px] font-black leading-tight', isSelected ? colors.score : 'text-foreground')}>
                      {plan.planName || cfg.label}
                    </p>
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-tight">{plan.summary?.slice(0, 60) || cfg.tagline}</p>
                </div>
                <ScoreDot score={score} color={cfg.color} />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 px-3 pb-2.5 flex-wrap">
                {plan.totalEstimatedCost > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <DollarSign className="w-2.5 h-2.5" />€{plan.totalEstimatedCost}
                  </span>
                )}
                {plan.totalWalkingMinutes > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Navigation className="w-2.5 h-2.5" />{plan.totalWalkingMinutes}m walk
                  </span>
                )}
                {plan.savingsVsShipExcursion > 0 && (
                  <span className="text-[9px] text-green-400 font-bold">Save €{plan.savingsVsShipExcursion}</span>
                )}
                {plan.recommendedReturnStartTime && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />Leave {plan.recommendedReturnStartTime}
                  </span>
                )}
              </div>

              {/* Why choose this */}
              {plan.whyChooseThis && (
                <div className={cn('px-3 py-2 border-t border-border/8 flex items-start gap-1.5', isSelected ? '' : 'hidden group-hover:flex')}>
                  <Heart className={cn('w-2.5 h-2.5 flex-shrink-0 mt-0.5', colors.score)} />
                  <p className="text-[9px] text-muted-foreground/70 leading-snug">{plan.whyChooseThis}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}