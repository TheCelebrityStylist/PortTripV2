import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Bus, Train, Car, Navigation, AlertTriangle, Clock, DollarSign,
  Sparkles, CheckCircle, Zap, RefreshCw, Ship, Bike, Star, TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Static fallback data — always shown instantly, never a blank loading screen
const STATIC_TRANSPORT = {
  'Ålesund': {
    pro_tip: 'Leave the ship early — Ålesund is tiny and crowds peak 10:00–13:00. A taxi to Aksla is the best €12 you will spend all cruise.',
    warnings: ['All taxis must be pre-booked or found at the pier — no Uber.', 'Tender port: add 20–30 min for tender boat queue each way.'],
    best: 'taxi',
    options: [
      { mode: 'taxi', name: 'Taxi to Aksla / Town Centre', from: 'Cruise pier', to: 'Town centre', duration_minutes: 5, cost_estimate: 12, cost_range: '€10–15', all_aboard_safe: true, tips: 'Fixed ranks at pier. Approx €10–12 to any point in central Ålesund. Drivers speak English.', frequency: 'On demand at pier' },
      { mode: 'walk', name: 'Walk to town centre', from: 'Cruise pier', to: 'Brosundet canal', duration_minutes: 12, cost_estimate: 0, cost_range: 'Free', all_aboard_safe: true, tips: 'Flat 1.1km along the waterfront. Scenic. Fine for able walkers.', frequency: 'Anytime' },
      { mode: 'bus', name: 'Local Bus (limited service)', from: 'Pier stop', to: 'Bus station', duration_minutes: 10, cost_estimate: 3, cost_range: '~€3', all_aboard_safe: true, tips: 'Buses run infrequently. Check schedule at pier info desk. Not worth it vs taxi for groups of 2+.', frequency: 'Every 30–60 min' },
    ],
    return_strategy: 'Allow 45 min to return (30 min tender queue + 15 min pier walk). Leave town no later than all-aboard minus 50 min.',
  },
  'Barcelona': {
    pro_tip: 'Bus T3 from the World Trade Centre (Drassanes stop) runs every 10 min and costs €2.40 — fastest option to Las Ramblas.',
    warnings: ['Pickpockets on Las Ramblas — use a money belt.', 'Taxi from Port Vell to Sagrada Família can take 25+ min in peak traffic.'],
    best: 'bus',
    options: [
      { mode: 'bus', name: 'Bus T3 — Port to Las Ramblas', from: 'WTC Cruise Terminal', to: 'Drassanes / Las Ramblas', duration_minutes: 8, cost_estimate: 2, cost_range: '€2.40', all_aboard_safe: true, tips: 'Bus T3 departs every 8–12 min. Buy T-Casual (10-journey) card for €11.35 if exploring all day.', frequency: 'Every 8–12 min' },
      { mode: 'taxi', name: 'Taxi from pier', from: 'Terminal cruise taxi rank', to: 'Any point in central Barcelona', duration_minutes: 12, cost_estimate: 14, cost_range: '€12–18', all_aboard_safe: true, tips: 'Official yellow/black taxis only. Metered — no negotiation needed. Uber also works in Barcelona.', frequency: 'On demand at rank' },
      { mode: 'walk', name: 'Walk to Barceloneta Beach', from: 'Cruise terminal', to: 'Barceloneta', duration_minutes: 18, cost_estimate: 0, cost_range: 'Free', all_aboard_safe: true, tips: 'Pleasant 1.5km walk along the port promenade. Best for beach-only days.', frequency: 'Anytime' },
    ],
    return_strategy: 'Allow 35 min return. Bus T3 back to pier takes 10 min from Drassanes. Taxis add 5–10 min queue time at busy spots.',
  },
  'Dubrovnik': {
    pro_tip: 'Arrive at the Old Town walls by 08:30 — by 10:00 it is a queue. Wall tickets are €35 at the gate or €28 online.',
    warnings: ['Cruise day crowds in Dubrovnik are extreme June–Sept. Walls close to new visitors by midday in peak season.', 'Only take licensed taxis — negotiate price before entering.'],
    best: 'taxi',
    options: [
      { mode: 'taxi', name: 'Taxi to Old Town (Pile Gate)', from: 'Gruz Port taxi rank', to: 'Old Town Pile Gate', duration_minutes: 10, cost_estimate: 12, cost_range: '€10–15', all_aboard_safe: true, tips: 'Negotiate before getting in. €10–12 is fair. Morning only — afternoon traffic adds 10+ min.', frequency: 'On demand at rank' },
      { mode: 'bus', name: 'Local Bus No. 1A/1B', from: 'Gruz Port bus stop', to: 'Pile Gate (Old Town entrance)', duration_minutes: 15, cost_estimate: 2, cost_range: '€2', all_aboard_safe: true, tips: 'Runs every 15 min. Buy ticket from driver (exact change helps). Cheaper but slower than taxi.', frequency: 'Every 15 min' },
      { mode: 'taxi', name: 'Cable car + Srđ hill (taxi combo)', from: 'Gruz Port', to: 'Cable car base (Bosanka St)', duration_minutes: 12, cost_estimate: 14, cost_range: '€14 taxi + €18 cable car return', all_aboard_safe: true, tips: 'Go here FIRST before Old Town — morning views are exceptional and there is zero queue before 09:30.', frequency: 'On demand' },
    ],
    return_strategy: 'Allow 40 min return from Old Town. Bus 1A back to Gruz is slowest option. Taxi is most reliable — 10–12 min.',
  },
  'Santorini': {
    pro_tip: 'Skip the cable car queue entirely — take the donkeys up or walk the 588 steps from Fira port. Cable car line can be 45 min in peak season.',
    warnings: ['Tender port — add 30–45 min each way for tender boat. Factor this into your plan.', 'Only 4 hours usable time if all-aboard is 17:00 — do NOT try to do both Oia and Akrotiri in one day.'],
    best: 'taxi',
    options: [
      { mode: 'taxi', name: 'Taxi from Fira to Oia', from: 'Fira taxi station', to: 'Oia village', duration_minutes: 20, cost_estimate: 18, cost_range: '€15–20', all_aboard_safe: true, tips: 'Fixed taxi fares are posted at the rank. Agree before entering. Return taxi from Oia can be scarce — book return with same driver.', frequency: 'On demand' },
      { mode: 'bus', name: 'KTEL Bus Fira to Oia', from: 'Fira bus station (central square)', to: 'Oia', duration_minutes: 35, cost_estimate: 2, cost_range: '€2', all_aboard_safe: true, tips: 'Runs hourly. Cheap but takes 35 min vs 20 min taxi. Not ideal if time is tight.', frequency: 'Hourly' },
      { mode: 'walk', name: 'Walk from tender dock to Fira', from: 'Fira port (Skala)', to: 'Fira town', duration_minutes: 25, cost_estimate: 0, cost_range: 'Free', all_aboard_safe: true, tips: '588 steps up. Hard work but worth it — skips cable car queue. Allow 25–35 min depending on fitness.', frequency: 'Anytime' },
    ],
    return_strategy: 'Allow 60 min to return: 20 min taxi from any point + 30 min tender queue + 10 min buffer. Leave wherever you are by all-aboard minus 65 min.',
  },
  'Kotor': {
    pro_tip: 'The Old Town walls are the only thing worth doing in Kotor. Go first thing — it takes 2 hours and the views at the top are extraordinary.',
    warnings: ['Old Town wall tickets (€8) are sold at the entrance only. No online booking.'],
    best: 'walk',
    options: [
      { mode: 'walk', name: 'Walk from pier to Old Town', from: 'Cruise pier', to: 'Old Town entrance', duration_minutes: 5, cost_estimate: 0, cost_range: 'Free', all_aboard_safe: true, tips: 'Literally 300 metres from most cruise berths. No transport needed to get to the Old Town.', frequency: 'Anytime' },
      { mode: 'taxi', name: 'Taxi to Perast / Our Lady of the Rocks', from: 'Cruise pier', to: 'Perast village', duration_minutes: 20, cost_estimate: 20, cost_range: '€18–25', all_aboard_safe: true, tips: 'Worth it if you have 5+ hours. Perast is a stunning baroque village 10km from Kotor. Negotiate return trip with same driver (€35–40 return).', frequency: 'On demand at pier' },
    ],
    return_strategy: 'You are within 5 min walk of the ship at all times. Just watch your watch — no transport delays possible here.',
  },
};

// Normalise city name to look up static data
function getStaticData(city) {
  if (!city) return null;
  const key = Object.keys(STATIC_TRANSPORT).find(k => city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase()));
  return key ? STATIC_TRANSPORT[key] : null;
}

const MODE_CONFIG = {
  bus:      { icon: Bus,        label: 'Bus',       color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  train:    { icon: Train,      label: 'Train',     color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  taxi:     { icon: Car,        label: 'Taxi',      color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  rideshare:{ icon: Car,        label: 'Rideshare', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  walk:     { icon: Navigation, label: 'Walk',      color: 'text-accent',     bg: 'bg-accent/10 border-accent/20' },
  ferry:    { icon: Ship,       label: 'Ferry',     color: 'text-sky-400',    bg: 'bg-sky-400/10 border-sky-400/20' },
  bike:     { icon: Bike,       label: 'Bike',      color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
};

export default function TransportHub({ plan }) {
  const staticData = getStaticData(plan?.port_city);
  const [data, setData] = useState(staticData);
  const [loading, setLoading] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('portChat', {
        mode: 'transport',
        port_city: plan.port_city,
        all_aboard_time: plan.all_aboard_time,
        buffer_minutes: plan.buffer_minutes,
        tender_delay_minutes: plan.tender_delay_minutes,
      });
      if (res.data?.transport) {
        setData(res.data.transport);
        setAiEnhanced(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!plan?.port_city) return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <Bus className="w-10 h-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">Set up your port day first</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center">
        <Bus className="w-8 h-8 text-accent" />
      </div>
      <div>
        <h3 className="text-base font-black text-foreground mb-2">Transport for {plan.port_city}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">No static data for this port yet. Load AI-powered options.</p>
      </div>
      <Button onClick={load} disabled={loading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl px-8">
        <Zap className="w-4 h-4" /> Load transport options
      </Button>
    </div>
  );

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground">Getting around {plan.port_city}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground">All-aboard: {plan.all_aboard_time} · {data?.options?.length || 0} options</p>
            {aiEnhanced
              ? <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-2.5 h-2.5" />AI-verified</span>
              : <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Curated data</span>
            }
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> {loading ? 'Updating…' : 'Enhance with AI'}
        </Button>
      </div>

      {data?.warnings?.length > 0 && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/8 p-4 space-y-2">
          <p className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" />Watch out</p>
          {data.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-300/80 pl-5">{w}</p>
          ))}
        </div>
      )}

      {data?.pro_tip && (
        <div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3.5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">{data.pro_tip}</p>
        </div>
      )}

      <div className="space-y-3">
        {(data?.options || []).map((opt, i) => {
          const cfg = MODE_CONFIG[opt.mode] || MODE_CONFIG.bus;
          const Icon = cfg.icon;
          const isSafe = opt.all_aboard_safe !== false;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={cn("rounded-2xl border p-4 transition-all", !isSafe ? "border-red-400/25 bg-red-400/5" : "border-border/30 bg-card/50 hover:border-accent/20")}>
              <div className="flex items-start gap-4">
                <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", cfg.bg)}>
                  <Icon className={cn("w-5 h-5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-foreground">{opt.name}</h4>
                        {!isSafe && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-400/15 text-red-400 border border-red-400/20">RISKY</span>}
                        {isSafe && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-400/15 text-green-400 border border-green-400/20">SAFE</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.from} → {opt.to}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {opt.duration_minutes > 0 && (
                        <span className="text-xs font-bold text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />{opt.duration_minutes}min
                        </span>
                      )}
                      {(opt.cost_range || opt.cost_estimate > 0) && (
                        <span className="text-xs font-bold text-accent flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />{opt.cost_range || `€${opt.cost_estimate}`}
                        </span>
                      )}
                    </div>
                  </div>
                  {opt.frequency && <p className="text-xs text-muted-foreground mb-1">🔄 {opt.frequency}</p>}
                  {opt.tips && <p className="text-xs text-muted-foreground/70 italic leading-relaxed border-t border-border/20 pt-2 mt-2">{opt.tips}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {data?.return_strategy && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 flex items-start gap-3">
          <TrendingDown className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-accent uppercase tracking-wider mb-1">Return Strategy</p>
            <p className="text-sm text-foreground leading-relaxed">{data.return_strategy}</p>
          </div>
        </div>
      )}
    </div>
  );
}