import { motion } from 'framer-motion';

export default function TimelineConnector({ spacing, index }) {
  const height = Math.max(24, spacing);

  return (
    <div
      className="relative flex items-start"
      style={{ height: `${height}px` }}
    >
      {/* Time column spacer */}
      <div className="w-20 shrink-0" />

      {/* The connecting line segment */}
      <div className="relative flex justify-center shrink-0" style={{ width: '24px', height: '100%' }}>
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.06 + 0.1, duration: 0.3, ease: 'easeOut' }}
          className="w-px bg-timeline-spine origin-top"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}