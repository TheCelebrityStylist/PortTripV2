import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronDown, DollarSign, MapPin, Sparkles, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeStyles = {
  arrival: 'bg-primary text-primary-foreground ring-primary/20',
  departure: 'bg-primary text-primary-foreground ring-primary/20',
  stop: 'bg-card text-foreground ring-border',
  transfer: 'bg-secondary text-secondary-foreground ring-secondary/40',
  buffer: 'bg-muted text-muted-foreground ring-muted/40',
  transit: 'bg-timeline-transit/10 text-timeline-transit ring-timeline-transit/20',
};

const dotStyles = {
  arrival: 'bg-accent border-accent shadow-accent/30',
  departure: 'bg-accent border-accent shadow-accent/30',
  stop: 'bg-primary border-primary shadow-primary/20',
  transfer: 'bg-timeline-transit border-timeline-transit shadow-timeline-transit/20',
  buffer: 'bg-muted-foreground/40 border-muted-foreground/40',
  transit: 'bg-timeline-transit border-timeline-transit shadow-timeline-transit/20',
};

export default function TimelineNode({ node, index, onEdit, onDelete, onAiRefine }) {
  const [expanded, setExpanded] = useState(false);
  const isTerminal = node.blockType === 'arrival' || node.blockType === 'departure';
  const isTransit = node.blockType === 'transit';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex items-start group"
    >
      {/* Time column */}
      <div className="w-20 shrink-0 pt-2 text-right pr-6">
        <span className={cn(
          "text-xs font-medium tracking-wide",
          isTerminal ? "text-accent" : "text-muted-foreground"
        )}>
          {node.startTime}
        </span>
      </div>

      {/* Dot on the spine */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: '24px' }}>
        <div className={cn(
          "rounded-full border-2 z-10 transition-all duration-300",
          dotStyles[node.blockType] || dotStyles.stop,
          isTerminal ? "w-4 h-4 shadow-lg" : "w-3 h-3 shadow-sm",
          "group-hover:scale-125"
        )} />
      </div>

      {/* Content */}
      <div className={cn(
        "ml-5 flex-1 rounded-xl border transition-all duration-300 cursor-pointer",
        typeStyles[node.blockType] || typeStyles.stop,
        isTransit ? "py-2 px-4" : "p-4",
        "hover:shadow-md hover:translate-x-0.5",
        expanded && "shadow-md"
      )}
        onClick={() => !isTransit && setExpanded(!expanded)}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <node.Icon className={cn(
              "shrink-0",
              isTerminal ? "w-4.5 h-4.5" : "w-4 h-4",
              isTransit && "text-timeline-transit"
            )} />
            <div className="min-w-0">
              <h3 className={cn(
                "font-medium leading-tight truncate",
                isTerminal ? "text-sm" : "text-sm",
                isTransit && "text-xs text-muted-foreground"
              )}>
                {node.title}
              </h3>
              {node.subtitle && !isTransit && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{node.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {node.durationLabel && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                isTransit ? "text-muted-foreground/70" : "text-muted-foreground"
              )}>
                <Clock className="w-3 h-3" />
                {node.durationLabel}
              </span>
            )}
            {!isTransit && (
              <ChevronDown className={cn(
                "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200",
                expanded && "rotate-180"
              )} />
            )}
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && !isTransit && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 pt-3 border-t border-border/50 space-y-2"
          >
            {node.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />{node.location}
              </p>
            )}
            {node.startTime && node.endTime && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" />{node.startTime} — {node.endTime}
              </p>
            )}
            {node.costEstimate > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" />Est. cost: €{node.costEstimate}
              </p>
            )}
            {node.notes && (
              <p className="text-xs text-muted-foreground/80 italic leading-relaxed">{node.notes}</p>
            )}
            {node.imageUrl && (
              <img src={node.imageUrl} alt={node.title} className="w-full h-32 object-cover rounded-lg mt-2" />
            )}
            <div className="flex items-center gap-2 pt-1">
              {onAiRefine && (
                <button onClick={(e) => { e.stopPropagation(); onAiRefine(node); }}
                  className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/15 rounded-lg px-2.5 py-1 transition-all">
                  <Sparkles className="w-3 h-3" /> Refine with AI
                </button>
              )}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive bg-secondary hover:bg-destructive/10 rounded-lg px-2.5 py-1 transition-all">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}