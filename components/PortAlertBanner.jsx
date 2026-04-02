import { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const SEVERITY_STYLES = {
  low: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  high: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
  critical: 'bg-red-500/10 border-red-500/30 text-red-300',
};

const TYPE_LABELS = {
  strike: '🚌 Strike',
  closure: '🚫 Closure',
  weather: '⛈️ Weather',
  delay: '⏱️ Delay',
  security: '🔒 Security',
  other: '⚠️ Alert',
};

export default function PortAlertBanner({ cities = [], className }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchAlerts = async () => {
    if (!cities.length) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('portAlerts', { cities });
      setAlerts(res?.data?.alerts || []);
      setLastChecked(new Date());
    } catch (e) {
      console.error('Alert fetch failed:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (cities.length) fetchAlerts();
  }, [cities.join(',')]);

  const visible = alerts.filter(a => !dismissed.includes(a.title));

  if (!visible.length && !loading) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Checking for port alerts...
        </div>
      )}

      {visible.map((alert, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border px-4 py-3 flex items-start gap-3",
            SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium
          )}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {TYPE_LABELS[alert.alert_type] || '⚠️ Alert'}
              </span>
              <span className="text-xs opacity-60">·</span>
              <span className="text-xs opacity-70">{alert.city}</span>
            </div>
            <p className="text-sm font-semibold mt-0.5 leading-tight">{alert.title}</p>
            {alert.description && (
              <p className="text-xs opacity-80 mt-1 leading-relaxed">{alert.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAlerts}
              className="opacity-50 hover:opacity-100 transition-opacity"
              title="Refresh alerts"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDismissed(prev => [...prev, alert.title])}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}