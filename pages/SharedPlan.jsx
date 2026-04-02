import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Anchor, Clock, Users, MapPin, Shield, Ship } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SafetyTimer from '../components/SafetyTimer';

function parseTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d;
}

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const BLOCK_COLORS = {
  stop: 'bg-accent/20 text-accent border-accent/30',
  transit: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  arrival: 'bg-green-400/10 text-green-400 border-green-400/20',
  departure: 'bg-red-400/10 text-red-400 border-red-400/20',
  buffer: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
};

export default function SharedPlan() {
  const { token } = useParams();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['sharedPlan', token],
    queryFn: () => base44.entities.PortDayPlan.filter({ share_token: token }),
  });

  const plan = plans[0];

  const { data: blocks = [] } = useQuery({
    queryKey: ['sharedBlocks', plan?.id],
    queryFn: () => base44.entities.PlanBlock.filter({ trip_id: plan.id }, 'order_index', 200),
    enabled: !!plan?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Ship className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Plan not found</h1>
        <p className="text-sm text-muted-foreground">This shared link may have expired or is invalid.</p>
        <Link to="/"><Button variant="outline" className="rounded-full">Go to PortTrip</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared banner */}
      <div className="bg-accent/10 border-b border-accent/20 py-2 px-6 text-center">
        <p className="text-xs text-accent font-medium flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Shared itinerary — view only · Powered by <span className="font-bold">PortTrip</span>
        </p>
      </div>

      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Anchor className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{plan.port_city}</h1>
              <p className="text-xs text-muted-foreground">
                {plan.port_date ? new Date(plan.port_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Port Day Itinerary'}
              </p>
            </div>
          </div>
          <Link to="/planner">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full text-xs gap-1.5">
              Create my own plan →
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Safety timer */}
        {plan.all_aboard_time && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SafetyTimer
              allAboardTime={plan.all_aboard_time}
              bufferMinutes={plan.buffer_minutes || 90}
              tenderDelayMinutes={plan.tender_delay_minutes || 0}
            />
          </motion.div>
        )}

        {/* Quick facts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card/60 border border-border/40 p-3 text-center">
              <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">All aboard</p>
              <p className="text-sm font-bold text-foreground">{plan.all_aboard_time}</p>
            </div>
            <div className="rounded-xl bg-card/60 border border-border/40 p-3 text-center">
              <MapPin className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Stops</p>
              <p className="text-sm font-bold text-foreground">{blocks.length}</p>
            </div>
            <div className="rounded-xl bg-card/60 border border-border/40 p-3 text-center">
              <Shield className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Buffer</p>
              <p className="text-sm font-bold text-foreground">{plan.buffer_minutes || 90}min</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        {blocks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Day Itinerary</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />
              <div className="space-y-3">
                {blocks.map((b, i) => (
                  <div key={b.id} className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold text-accent">
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-border/40 bg-card/60 p-3 pb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">{b.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${BLOCK_COLORS[b.block_type] || BLOCK_COLORS.stop}`}>
                          {b.block_type}
                        </span>
                      </div>
                      {b.subtitle && <p className="text-xs text-muted-foreground mb-1">{b.subtitle}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {b.start_time && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{fmt(b.start_time)}
                            {b.end_time && ` – ${fmt(b.end_time)}`}
                          </span>
                        )}
                        {b.duration_minutes && !b.start_time && (
                          <span className="text-xs text-muted-foreground">{b.duration_minutes} min</span>
                        )}
                        {b.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{b.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
            <Anchor className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">Build your own cruise port plan</h3>
            <p className="text-xs text-muted-foreground mb-4">AI-powered itineraries with safety timers, budget tracking, and offline access.</p>
            <Link to="/planner">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full gap-2 text-sm">
                Start planning free →
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}