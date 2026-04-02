import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COUNTRY_FLAGS = {
  no: '🇳🇴', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷', gr: '🇬🇷',
  hr: '🇭🇷', pt: '🇵🇹', mt: '🇲🇹', tr: '🇹🇷', me: '🇲🇪',
  al: '🇦🇱', ba: '🇧🇦', gb: '🇬🇧', de: '🇩🇪', nl: '🇳🇱',
  be: '🇧🇪', dk: '🇩🇰', se: '🇸🇪', fi: '🇫🇮', ee: '🇪🇪',
  lv: '🇱🇻', lt: '🇱🇹', pl: '🇵🇱', is: '🇮🇸',
};

export default function PortCard({ port, index, compact = false }) {
  const flag = COUNTRY_FLAGS[port.country_code?.toLowerCase()] || '🌍';
  const desc = port.description?.replace(/<[^>]*>/g, '').slice(0, 100) + '...' || '';

  if (compact) {
    return (
      <Link
        to={`/port/${encodeURIComponent(port.city)}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-card hover:border-accent/30 transition-all group"
      >
        <span className="text-xl">{flag}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">{port.city}</p>
          {port.region && <p className="text-xs text-muted-foreground truncate">{port.region}</p>}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        to={`/port/${encodeURIComponent(port.city)}`}
        className="group block p-5 rounded-xl border border-border/40 bg-card/60 hover:bg-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{flag}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
              {port.city}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {port.region && (
                <span className="text-xs text-muted-foreground">{port.region}</span>
              )}
              {port.tender_port && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                  Tender
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent transition-colors shrink-0 mt-1" />
        </div>
        {desc && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{desc}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          {port.language && (
            <span className="text-xs text-muted-foreground/60">{port.language}</span>
          )}
          {port.currency && (
            <span className="text-xs text-muted-foreground/60">{port.currency}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}