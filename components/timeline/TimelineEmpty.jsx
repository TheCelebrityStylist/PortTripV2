import { motion } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimelineEmpty({ onAddFirst }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <MapPin className="w-7 h-7 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Your journey starts here
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Add your first stop to begin building your timeline. Each stop becomes a node in your journey flow.
      </p>

      {/* Visual empty spine hint */}
      <div className="flex flex-col items-center gap-0 mb-8">
        <div className="w-3 h-3 rounded-full border-2 border-timeline-spine bg-background" />
        <div className="w-px h-12 bg-timeline-spine/40" />
        <div className="w-2 h-2 rounded-full bg-timeline-spine/30" />
        <div className="w-px h-12 bg-timeline-spine/20" />
        <div className="w-2 h-2 rounded-full bg-timeline-spine/10" />
      </div>

      <Button
        onClick={onAddFirst}
        className="gap-2 rounded-full px-6"
      >
        <Plus className="w-4 h-4" />
        Add first stop
      </Button>
    </motion.div>
  );
}