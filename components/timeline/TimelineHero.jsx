import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mapBlocksToNodes, groupNodesByDay } from '@/lib/timelineMapper';
import TimelineNode from './TimelineNode';
import TimelineConnector from './TimelineConnector';
import DayDivider from './DayDivider';
import TimelineEmpty from './TimelineEmpty';

export default function TimelineHero({ planBlocks, onEditBlock, onDeleteBlock, onAiRefine, isLoading }) {
  const dayGroups = useMemo(() => {
    const nodes = mapBlocksToNodes(planBlocks);
    return groupNodesByDay(nodes);
  }, [planBlocks]);

  if (isLoading) {
    return <TimelineLoading />;
  }

  if (!planBlocks || planBlocks.length === 0) {
    return <TimelineEmpty />;
  }

  let globalIndex = 0;

  return (
    <div className="relative py-8">
      {/* The continuous spine background line */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{ marginLeft: 'calc(5rem + 11px)' }}
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-px h-full bg-gradient-to-b from-transparent via-timeline-spine to-transparent origin-top"
        />
      </div>

      {dayGroups.map((group, groupIdx) => (
        <div key={group.date || groupIdx}>
          <DayDivider label={group.label} index={groupIdx} />

          {group.nodes.map((node, nodeIdx) => {
            const currentGlobal = globalIndex++;
            return (
              <div key={node.id}>
                <TimelineNode
                  node={node}
                  index={currentGlobal}
                  onEdit={onEditBlock}
                  onDelete={onDeleteBlock}
                  onAiRefine={onAiRefine}
                />
                {nodeIdx < group.nodes.length - 1 && (
                  <TimelineConnector
                    spacing={node.spacingAfter}
                    index={currentGlobal}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Terminal cap */}
      <div className="relative flex items-center pt-6">
        <div className="w-20 shrink-0" />
        <div className="relative flex justify-center shrink-0" style={{ width: '24px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="w-2 h-2 rounded-full bg-timeline-spine/60"
          />
        </div>
      </div>
    </div>
  );
}

function TimelineLoading() {
  return (
    <div className="py-16 flex flex-col items-center gap-4">
      <div className="w-px h-32 bg-gradient-to-b from-transparent via-timeline-spine to-transparent animate-pulse-soft" />
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-timeline-spine animate-pulse-soft" />
        <div className="h-3 w-32 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="w-px h-16 bg-gradient-to-b from-timeline-spine via-timeline-spine to-transparent animate-pulse-soft" />
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-timeline-spine animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
        <div className="h-3 w-48 bg-muted rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>
      <div className="w-px h-16 bg-gradient-to-b from-timeline-spine via-timeline-spine to-transparent animate-pulse-soft" />
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-timeline-spine animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
        <div className="h-3 w-40 bg-muted rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
      </div>
    </div>
  );
}