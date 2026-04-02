/**
 * PlanIntelligenceCard — "Why this day is great" strategic intelligence layer.
 * Shows route logic, biggest time saver, top risk, emotional peak, timing advice.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Clock, AlertTriangle, Star, TrendingUp, ChevronDown, ChevronUp, Shield, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const INTEL_ROWS = [
  { key: 'whyThisOrder',      icon: Route,         color: 'text-accent',      label: 'Why this order' },
  { key: 'biggestTimeSaver',  icon: Clock,         color: 'text-green-400',   label: 'Biggest time saver' },
  { key: 'biggestRisk',       icon: AlertTriangle, color: 'text-red-400',     label: 'Top risk today' },
  { key: 'emotionalPeak',     icon: Star,          color: 'text-yellow-400',  label: 'Emotional peak' },
  { key: 'timingAdvice',      icon: Target,        color: 'text-orange-400',  label: 'Stay strict on timing' },
  { key: 'relaxMoment',       icon: Shield,        color: 'text-blue-400',    label: 'Where to relax' },
  { key: 'routeVsAlternative',icon: TrendingUp,    color: 'text-purple-400',  label: 'Why this beats the obvious route' },
];

export default function PlanIntelligenceCard({ planResult }) {
  const [open, setOpen] = useState(false);
  const intel = planResult?.routeIntelligence;
  if (!intel) return null;

  const rows = INTEL_ROWS.filter(r => intel[r.key]);
  if (!rows.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/25 bg-card/40 overflow-hidden mb-4"
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-card/60 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
            <Lightbulb className="w-3 h-3 text-accent" />
          </div>
          <span className="text-xs font-black text-foreground">Why This Day Is Great</span>
          <span className="text-[9px] text-muted-foreground/50 font-semibold">{rows.length} insights</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-border/10">
              {rows.map(row => (
                <div key={row.key} className={cn(
                  'flex items-start gap-2.5 px-3 py-2.5 rounded-xl border mt-2',
                  row.color === 'text-accent' ? 'border-accent/15 bg-accent/5'
                    : row.color === 'text-red-400' ? 'border-red-400/12 bg-red-400/4'
                    : row.color === 'text-yellow-400' ? 'border-yellow-400/12 bg-yellow-400/4'
                    : 'border-border/10 bg-card/30'
                )}>
                  <row.icon className={cn('w-3 h-3 flex-shrink-0 mt-0.5', row.color)} />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wide text-muted-foreground/50 mb-0.5">{row.label}</p>
                    <p className="text-[11px] text-foreground/85 leading-snug">{intel[row.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}