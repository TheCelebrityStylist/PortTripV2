import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlanDeltaCard({ delta }) {
  if (!delta?.previousPlanScore || !delta?.newPlanScore) return null;

  const improvement = delta.newPlanScore - delta.previousPlanScore;
  if (improvement <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-accent/30 bg-accent/5 p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3 h-3 text-accent" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-accent">AI improved your plan</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Before</p>
          <motion.p
            className="text-xl font-black text-muted-foreground tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {delta.previousPlanScore}
          </motion.p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <ArrowRight className="w-4 h-4 text-accent" />
          <motion.span
            className="text-[10px] font-black text-accent"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            +{improvement} pts
          </motion.span>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">After</p>
          <motion.p
            className="text-2xl font-black text-green-400 tabular-nums"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {delta.newPlanScore}
          </motion.p>
        </div>
      </div>

      {delta.changes?.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/15">
          {delta.changes.slice(0, 4).map((change, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <TrendingUp className="w-2.5 h-2.5 text-accent flex-shrink-0 mt-0.5" />
              {change}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}