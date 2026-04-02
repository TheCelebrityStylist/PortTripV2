/**
 * RouteOpportunities — surfaces nearby opportunities and watch-outs.
 * Two panels: Near Your Route (opportunities) + Watch-Outs (risks).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, Sparkles, TrendingDown, Users, Coffee, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPP_ICONS = {
  hidden_gem: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/8 border-purple-400/15' },
  better_lunch: { icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-400/8 border-orange-400/15' },
  cheaper_swap: { icon: TrendingDown, color: 'text-green-400', bg: 'bg-green-400/8 border-green-400/15' },
  less_crowded: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/8 border-blue-400/15' },
  default: { icon: MapPin, color: 'text-accent', bg: 'bg-accent/8 border-accent/15' },
};

const RISK_ICONS = {
  queue: { icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-400/8 border-yellow-400/15' },
  overrated: { icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-secondary border-border/20' },
  bottleneck: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/8 border-red-400/15' },
  default: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/8 border-yellow-400/15' },
};

function OppCard({ item, typeMap }) {
  const cfg = typeMap[item.type] || typeMap.default;
  const Icon = cfg.icon;
  return (
    <div className={cn('flex items-start gap-2.5 px-3 py-2.5 rounded-xl border', cfg.bg)}>
      <Icon className={cn('w-3 h-3 flex-shrink-0 mt-0.5', cfg.color)} />
      <div className="min-w-0">
        <p className={cn('text-[11px] font-bold leading-tight', cfg.color)}>{item.title}</p>
        {item.description && <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-snug">{item.description}</p>}
        {item.saving && <p className="text-[9px] text-green-400 font-bold mt-0.5">Save {item.saving}</p>}
      </div>
    </div>
  );
}

export default function RouteOpportunities({ planResult }) {
  const [oppOpen, setOppOpen] = useState(true);
  const [riskOpen, setRiskOpen] = useState(true);

  const opps = planResult?.nearbyOpportunities || [];
  const risks = planResult?.watchOuts || [];

  if (!opps.length && !risks.length) return null;

  return (
    <div className="space-y-3 mb-4">
      {/* Opportunities */}
      {opps.length > 0 && (
        <div className="rounded-2xl border border-purple-400/15 bg-purple-400/4 overflow-hidden">
          <button onClick={() => setOppOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-400/8 transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Near Your Route</span>
              <span className="text-[9px] text-muted-foreground/40">{opps.length}</span>
            </div>
            <ChevronDown className={cn('w-3 h-3 text-muted-foreground/30 transition-transform', oppOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {oppOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1.5">
                  {opps.map((o, i) => <OppCard key={i} item={o} typeMap={OPP_ICONS} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Watch-outs */}
      {risks.length > 0 && (
        <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/4 overflow-hidden">
          <button onClick={() => setRiskOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-yellow-400/8 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Watch-Outs</span>
              <span className="text-[9px] text-muted-foreground/40">{risks.length}</span>
            </div>
            <ChevronDown className={cn('w-3 h-3 text-muted-foreground/30 transition-transform', riskOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {riskOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1.5">
                  {risks.map((r, i) => <OppCard key={i} item={r} typeMap={RISK_ICONS} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}