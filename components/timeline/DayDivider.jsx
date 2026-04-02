import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function DayDivider({ label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative flex items-center py-6"
    >
      <div className="w-20 shrink-0" />
      <div className="relative flex justify-center shrink-0" style={{ width: '24px' }}>
        <div className="w-2 h-2 rounded-full bg-accent/60" />
      </div>
      <div className="ml-5 flex items-center gap-2.5">
        <Calendar className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          {label}
        </span>
      </div>
    </motion.div>
  );
}