import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingDown, Navigation, Users, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const TRAP_COLOR = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

function AltCard({ alt, onSwap }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/25 bg-background/40 px-3 py-2 hover:border-accent/30 transition-all group">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-foreground leading-tight truncate">{alt.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {alt.rating > 0 && (
            <span className="text-[9px] text-yellow-400 font-bold flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-yellow-400" />{alt.rating}
            </span>
          )}
          {alt.estimatedCostEur > 0 && (
            <span className="text-[9px] text-muted-foreground">€{alt.estimatedCostEur}</span>
          )}
          <span className="text-[9px] text-muted-foreground">{alt.estimatedVisitMin}min</span>
          {alt.distanceKm !== undefined && (
            <span className="text-[9px] text-muted-foreground">{alt.distanceKm}km away</span>
          )}
          {alt.touristTrapRisk === 'high' && (
            <span className="text-[9px] text-red-400 font-bold">⚠ Trap risk</span>
          )}
        </div>
      </div>
      {onSwap && (
        <button
          onClick={() => onSwap(alt)}
          className="w-6 h-6 rounded-md bg-secondary hover:bg-accent/20 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
          title="Swap this stop in"
        >
          <Plus className="w-3 h-3 text-accent" />
        </button>
      )}
    </div>
  );
}

export default function PlaceAlternatives({ alternatives, stopTitle, onSwap }) {
  const [open, setOpen] = useState(false);
  if (!alternatives?.length) return null;

  return (
    <div className="mt-2">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-accent transition-colors font-semibold"
      >
        <Navigation className="w-3 h-3" />
        {alternatives.length} alternatives nearby
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden mt-2 space-y-1.5"
          >
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">
              Instead of {stopTitle}
            </p>
            {alternatives.map((alt) => (
              <AltCard key={alt.id} alt={alt} onSwap={onSwap} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}