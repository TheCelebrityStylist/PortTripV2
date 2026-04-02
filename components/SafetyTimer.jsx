import { useMemo } from 'react';
import { AlertTriangle, Clock, Ship, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getRiskLevel(bufferMins, tenderMins) {
  const total = bufferMins + tenderMins;
  if (total >= 90) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' };
  if (total >= 45) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' };
  return { level: 'High', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
}

export default function SafetyTimer({ allAboardTime, bufferMinutes = 90, tenderDelayMinutes = 0, className }) {
  const { mustReturnBy, risk } = useMemo(() => {
    if (!allAboardTime) return { mustReturnBy: null, risk: null };
    const allAboard = parseTime(allAboardTime);
    if (!allAboard) return { mustReturnBy: null, risk: null };
    const totalBuffer = (bufferMinutes || 90) + (tenderDelayMinutes || 0);
    const mustReturn = new Date(allAboard.getTime() - totalBuffer * 60000);
    return {
      mustReturnBy: mustReturn,
      risk: getRiskLevel(bufferMinutes, tenderDelayMinutes),
    };
  }, [allAboardTime, bufferMinutes, tenderDelayMinutes]);

  if (!mustReturnBy) return null;

  return (
    <div className={cn(
      "rounded-xl border p-4",
      risk?.bg,
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Ship className="w-4 h-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Return-to-Ship Safety Timer
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-sm text-muted-foreground">Must return by</span>
        <span className="text-2xl font-bold text-accent animate-timer-pulse">
          {formatTime(mustReturnBy)}
        </span>
        <span className="text-sm text-muted-foreground">
          for all-aboard at {allAboardTime}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
          Buffer: {bufferMinutes}min
        </span>
        {tenderDelayMinutes > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
            Tender delay: {tenderDelayMinutes}min
          </span>
        )}
        <span className={cn(
          "text-xs px-2 py-1 rounded-full border font-medium",
          risk?.bg, risk?.color
        )}>
          Risk: {risk?.level}
        </span>
      </div>
    </div>
  );
}