import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Sparkles, Settings2, Map, List, ReceiptText,
  Luggage, Bus, Send, Loader2, Check, X, Clock,
  ChevronDown, ChevronUp, MapPin, DollarSign, Trash2,
  Navigation, Ship, AlertTriangle, ExternalLink,
  Train, Car, Star, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddBlockDialog from '../components/timeline/AddBlockDialog';
import PlannerAiPanel from '../components/PlannerAiPanel';
import PlanLaunchFlow from '../components/PlanLaunchFlow';
import PlanHeroSummary from '../components/PlanHeroSummary';
import PlanVariantSelector from '../components/PlanVariantSelector';
import PlaceAlternatives from '../components/PlaceAlternatives';
import JourneyTimeline from '../components/JourneyTimeline';
import PlanIntelligenceCard from '../components/PlanIntelligenceCard';
import RouteOpportunities from '../components/RouteOpportunities';
import SharePlanButton from '../components/SharePlanButton';
import ExpenseTracker from '../components/ExpenseTracker';
import ExportPDFButton from '../components/ExportPDFButton';
import PackingList from '../components/PackingList';
import PortIntelligencePanel from '../components/PortIntelligencePanel';
import TransportHub from '../components/TransportHub';
import PortMap from '../components/PortMap';
import { cachePlan, getCachedPlan, isOffline } from '../utils/offlineCache';
import { invokePlanner } from '../utils/plannerApi';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Block type config ────────────────────────────────────────────────────────
const BLOCK_CONFIG = {
  arrival:   { icon: Ship,       color: 'text-accent',         dot: 'bg-accent',              card: 'border-accent/30 bg-accent/5' },
  departure: { icon: Ship,       color: 'text-accent',         dot: 'bg-accent',              card: 'border-accent/30 bg-accent/5' },
  stop:      { icon: MapPin,     color: 'text-foreground',     dot: 'bg-foreground/80',       card: 'border-border/30 bg-card/60 hover:bg-card/80 hover:border-accent/20 hover:shadow-md' },
  transit:   { icon: Navigation, color: 'text-muted-foreground', dot: 'bg-muted-foreground/40', card: '' },
  buffer:    { icon: AlertTriangle, color: 'text-yellow-400',  dot: 'bg-yellow-400',          card: 'border-yellow-400/20 bg-yellow-400/5' },
  transfer:  { icon: Navigation, color: 'text-blue-400',       dot: 'bg-blue-400',            card: 'border-blue-400/20 bg-blue-400/5' },
};

const TRANSPORT_ICONS = { walk: Navigation, bus: Bus, train: Train, taxi: Car, ferry: Ship, rideshare: Car };
const TRANSPORT_LABELS = { walk: 'Walk', bus: 'Bus', train: 'Metro/Train', taxi: 'Taxi', ferry: 'Ferry', rideshare: 'Rideshare' };

const TRAP_RISK_COLORS = { low: '', medium: 'text-yellow-400', high: 'text-red-400' };
const SCORE_COLOR = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
const TYPE_EMOJI = { arrival: '⚓', departure: '🚢', food: '🍽️', attraction: '📍', viewpoint: '🌅', shopping: '🛍️', return: '🔙', culture: '🏛️', nature: '🌿', relaxation: '☀️' };

// ─── Setup Dialog ─────────────────────────────────────────────────────────────
function PlanSetupDialog({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    port_city: '', all_aboard_time: '17:00', buffer_minutes: 90,
    tender_delay_minutes: 0, travel_mode: 'first_time', group_type: 'couple',
    budget_mode: 'mid_range', ship_excursion_price: '', diy_budget: '',
  });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Plan your port day</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">AI generates your full itinerary in seconds</p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Port city</Label>
            <Input className="mt-2 h-12 text-base bg-background/60 border-border/60 rounded-xl" placeholder="Barcelona, Santorini, Dubrovnik…" value={form.port_city} onChange={e => up('port_city', e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">All-aboard</Label>
              <Input type="time" className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl" value={form.all_aboard_time} onChange={e => up('all_aboard_time', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buffer (min)</Label>
              <Input type="number" className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl" value={form.buffer_minutes} onChange={e => up('buffer_minutes', parseInt(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tender (min)</Label>
              <Input type="number" className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl" value={form.tender_delay_minutes} onChange={e => up('tender_delay_minutes', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Travel style</Label>
              <Select value={form.travel_mode} onValueChange={v => up('travel_mode', v)}>
                <SelectTrigger className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['first_time','🗺️ First time'],['nature','🌿 Nature'],['history','🏛️ History'],['relaxation','☀️ Relaxation'],['culture','🎭 Culture']].map(([v,l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Group</Label>
              <Select value={form.group_type} onValueChange={v => up('group_type', v)}>
                <SelectTrigger className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[['solo','👤 Solo'],['couple','👫 Couple'],['family_kids','👨‍👩‍👧 Family'],['seniors','🧓 Seniors'],['group','👥 Group']].map(([v,l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ship tour (€)</Label>
              <Input type="number" className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl" placeholder="119" value={form.ship_excursion_price} onChange={e => up('ship_excursion_price', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">DIY budget (€)</Label>
              <Input type="number" className="mt-2 h-11 bg-background/60 border-border/60 rounded-xl" placeholder="35" value={form.diy_budget} onChange={e => up('diy_budget', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">Cancel</Button>
            <Button onClick={() => { onSave(form); onOpenChange(false); }} disabled={!form.port_city.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl px-6">
              <Sparkles className="w-4 h-4" /> Generate my itinerary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Timeline Block Card ──────────────────────────────────────────────────────
function BlockCard({ block, index, onDelete, onAiRefine }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = BLOCK_CONFIG[block.block_type] || BLOCK_CONFIG.stop;
  const Icon = cfg.icon;
  const isTransit = block.block_type === 'transit';
  const isTerminal = block.block_type === 'arrival' || block.block_type === 'departure';
  const TransIcon = TRANSPORT_ICONS[block.transport_mode] || Navigation;

  const dur = block.duration_minutes;
  const durLabel = dur >= 60 ? `${Math.floor(dur/60)}h${dur%60?` ${dur%60}m`:''}` : `${dur}m`;

  const mapsUrl = block.google_maps_query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.google_maps_query)}`
    : block.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.location)}`
    : null;

  // Parse rich metadata stored in color_tag
  const meta = (() => { try { return block.color_tag ? JSON.parse(block.color_tag) : null; } catch (_) { return null; } })();
  const stopScore = meta?.stopScore || meta?.worthItScore;
  const touristTrap = meta?.touristTrapRisk;

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative flex items-start gap-0">
      {/* Time */}
      <div className="w-16 flex-shrink-0 pt-3 text-right pr-3">
        <span className={cn("text-xs font-bold tabular-nums", isTerminal ? "text-accent" : "text-muted-foreground/50")}>
          {block.start_time ? new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
        </span>
      </div>

      {/* Spine + dot */}
      <div className="flex flex-col items-center flex-shrink-0 w-5 pt-3.5">
        <div className={cn("rounded-full flex-shrink-0 border-2 border-background transition-all", cfg.dot,
          isTerminal ? "w-3.5 h-3.5 shadow-lg shadow-accent/40" : "w-2.5 h-2.5")} />
      </div>

      {/* Card */}
      <div className="flex-1 ml-3 mb-2.5">
        {isTransit ? (
          <div className="flex items-center gap-3 py-2 px-3 my-0.5 rounded-xl bg-secondary/30 border border-border/20">
            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <TransIcon className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-muted-foreground">{block.title}</span>
              {block.notes && <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{block.notes}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {block.cost_estimate > 0 && <span className="text-[10px] text-muted-foreground">€{block.cost_estimate}</span>}
              {dur > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{durLabel}</span>}
            </div>
          </div>
        ) : (
          <div
            className={cn("rounded-2xl border transition-all cursor-pointer", cfg.card)}
            onClick={() => setExpanded(e => !e)}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              {/* Type emoji + icon */}
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base",
                isTerminal ? "bg-accent/15" : "bg-secondary/60")}>
                {TYPE_EMOJI[block.block_type] || TYPE_EMOJI[block.block_type] || <Icon className={cn("w-4 h-4", cfg.color)} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className={cn("text-sm font-bold leading-tight flex-1 min-w-0", isTerminal ? "text-accent" : "text-foreground")}>
                    {block.title}
                  </h3>
                  {/* Worth-it score badge */}
                  {stopScore > 0 && (
                    <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded-full border flex-shrink-0',
                      stopScore >= 80 ? 'text-green-400 border-green-400/20 bg-green-400/8' :
                      stopScore >= 60 ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/8' :
                      'text-muted-foreground border-border/20 bg-secondary'
                    )}>{stopScore}</span>
                  )}
                </div>
                {block.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{block.subtitle}</p>
                )}
                {/* Tourist trap warning */}
                {touristTrap && touristTrap !== 'low' && (
                  <span className={cn('text-[9px] font-bold', TRAP_RISK_COLORS[touristTrap])}>
                    {touristTrap === 'high' ? '⚠️ Tourist trap risk' : '⚠ Moderate crowds'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {block.cost_estimate > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />€{block.cost_estimate}
                  </span>
                )}
                {dur > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{durLabel}
                  </span>
                )}
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/40 transition-transform", expanded && "rotate-180")} />
              </div>
            </div>

            {/* Expanded panel */}
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-border/20 space-y-3">
                    {block.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-accent flex-shrink-0" />{block.location}
                      </p>
                    )}
                    {block.notes && (
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">{block.notes}</p>
                    )}
                    {block.insider_tip && (
                      <div className="flex items-start gap-2 bg-accent/8 border border-accent/15 rounded-xl px-3 py-2.5">
                        <Star className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed"><span className="font-bold text-accent">Insider tip: </span>{block.insider_tip}</p>
                      </div>
                    )}
                    {/* Alternatives */}
                    {meta?.alternatives?.length > 0 && (
                      <PlaceAlternatives alternatives={meta.alternatives} stopTitle={block.title} />
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {mapsUrl && (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                         className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/15 rounded-lg px-2.5 py-1.5 transition-all font-semibold">
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onAiRefine(block); }}
                        className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/15 rounded-lg px-2.5 py-1.5 transition-all font-semibold">
                        <Sparkles className="w-3 h-3" /> Refine with AI
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive bg-secondary hover:bg-destructive/10 rounded-lg px-2.5 py-1.5 transition-all">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Timeline View ────────────────────────────────────────────────────────────
function TimelineView({ blocks, isLoading, plan, onDelete, onAiRefine }) {
  if (isLoading) return (
    <div className="space-y-3 py-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 ml-16">
          <div className="w-2.5 h-2.5 rounded-full bg-border flex-shrink-0" />
          <div className="flex-1 h-14 rounded-2xl bg-card/40 animate-pulse" />
        </div>
      ))}
    </div>
  );

  if (blocks.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
      </div>
      <div>
        <p className="text-base font-bold text-foreground mb-1">Generating your {plan?.port_city} plan…</p>
        <p className="text-sm text-muted-foreground max-w-xs">AI is building your time-stamped port day. This takes about 15–30 seconds.</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 0.15, 0.3].map(d => (
          <div key={d} className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  );

  const totalCost = blocks.reduce((s, b) => s + (b.cost_estimate || 0), 0);

  return (
    <div className="py-4">
      {/* Spine line */}
      <div className="relative">
        <div className="absolute left-[84px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        <div className="space-y-0">
          {blocks.map((block, i) => (
            <BlockCard key={block.id} block={block} index={i} onDelete={onDelete} onAiRefine={onAiRefine} />
          ))}
        </div>
      </div>

      {/* Summary */}
      {blocks.length > 0 && (
        <div className="mx-16 mt-4 pt-4 border-t border-border/20 flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
          <span className="font-bold text-foreground">{blocks.filter(b => b.block_type === 'stop').length} stops</span>
          {totalCost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />€{totalCost} total estimated</span>}
          {plan?.diy_budget > 0 && plan?.ship_excursion_price > 0 && (
            <span className="text-green-400 font-black">Save ~€{plan.ship_excursion_price - plan.diy_budget} vs ship tour</span>
          )}
          {plan?.ship_excursion_price > 0 && !plan?.diy_budget && (
            <span className="text-accent font-bold">Avg saving: €82 per port vs ship tour</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI Chat Panel ────────────────────────────────────────────────────────────
const STARTERS = [
  'Build my full day itinerary',
  'Best local food near the port',
  'What are the must-see spots?',
  'Family-friendly plan for today',
  'Help me beat the ship tour price',
];

function AiChatPanel({ plan, blocks, onAcceptStop, refineStop, onClearRefine, cruisePort }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(new Set());
  const bottomRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!plan?.port_city) return;
    const welcome = refineStop
      ? `Tell me how you'd like to change **${refineStop.title}** — more time, alternative location, or swap it for something else?`
      : `I'm your AI guide for **${plan.port_city}**! All-aboard is at **${plan.all_aboard_time}** — I've got that covered. What would you like to do today?`;
    setMessages([{ id: 'w', role: 'assistant', content: welcome }]);
  }, [plan?.port_city, refineStop?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    const userMsg = { id: `u${idRef.current++}`, role: 'user', content };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    const result = await invokePlanner({
      action: 'build_full_itinerary',
      plan: { ...plan, current_stops: blocks.map(b => b.title).join(', '), userRequest: content },
    });

    const data = result?.data;
    setMessages(prev => [...prev, {
      id: `a${idRef.current++}`,
      role: 'assistant',
      content: data?.content || 'Something went wrong.',
      itinerary: data?.itinerary,
    }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-background/95 border-l border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground">AI Cruise Assistant</p>
            {refineStop && <p className="text-[10px] text-accent">Refining: {refineStop.title}</p>}
          </div>
        </div>
        {refineStop && (
          <button onClick={onClearRefine} className="text-[10px] text-muted-foreground hover:text-foreground bg-secondary px-2 py-1 rounded-lg">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                </div>
              )}
              <div className="max-w-[88%] space-y-2">
                {msg.content && (
                  <div className={cn("rounded-xl px-3 py-2.5 text-xs leading-relaxed",
                    msg.role === 'user'
                      ? "bg-accent text-accent-foreground rounded-tr-sm"
                      : "bg-card/80 border border-border/30 text-foreground rounded-tl-sm"
                  )}>
                    {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  </div>
                )}
                {/* Itinerary stops */}
                {msg.itinerary?.stops?.filter(s => s.block_type !== 'transit').map((s, idx) => {
                  const key = `${msg.id}-${idx}`;
                  const done = accepted.has(key);
                  return (
                    <div key={idx} className={cn("rounded-xl border px-3 py-2.5 flex items-center gap-2",
                      done ? "border-green-400/20 bg-green-400/5" : "border-border/30 bg-card/60")}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate">{s.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.duration_minutes > 0 && `${s.duration_minutes}min`}
                          {s.cost_estimate > 0 && ` · €${s.cost_estimate}`}
                        </p>
                      </div>
                      <button
                        onClick={() => { if (!done) { onAcceptStop(s); setAccepted(p => new Set([...p, key])); toast.success(`Added: ${s.title}`); } }}
                        className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                          done ? "bg-green-400/20 text-green-400" : "bg-accent/15 text-accent hover:bg-accent/25")}>
                        {done ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-accent animate-pulse" />
            </div>
            <div className="bg-card/80 border border-border/30 rounded-xl rounded-tl-sm px-3 py-2.5 flex gap-1">
              {[0, 0.12, 0.24].map(d => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {messages.length <= 1 && !loading && (
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="text-left text-[11px] px-3 py-2 rounded-xl border border-border/30 text-muted-foreground hover:border-accent/40 hover:text-foreground hover:bg-card/40 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/20 flex-shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 h-10 rounded-xl border border-border/40 bg-background/60 px-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent/50 transition-colors"
            placeholder="Ask anything about your port day…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <Button onClick={() => send()} disabled={!input.trim() || loading} className="h-10 w-10 p-0 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl flex-shrink-0">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Safety strip ─────────────────────────────────────────────────────────────
function SafetyStrip({ plan }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const [h, m] = plan.all_aboard_time.split(':').map(Number);
  const allAboard = new Date(); allAboard.setHours(h, m, 0, 0);
  const buffer = (plan.buffer_minutes || 90) + (plan.tender_delay_minutes || 0);
  const mustLeave = new Date(allAboard.getTime() - buffer * 60000);
  const minsLeft = Math.floor((mustLeave - now) / 60000);
  const isPast = minsLeft < 0;
  const isCritical = minsLeft >= 0 && minsLeft < 30;
  const isWarning = minsLeft >= 30 && minsLeft < 75;

  // Safe return score: 100% if >2h left, scales down
  const totalMins = Math.floor((mustLeave - (new Date().setHours(8,30,0,0), new Date(new Date().setHours(8,30,0,0)))) / 60000);
  const score = isPast ? 0 : Math.min(100, Math.max(0, Math.round((minsLeft / Math.max(totalMins, 1)) * 100)));
  const scoreColor = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className={cn("flex items-center gap-2 text-xs font-bold",
        isPast ? "text-red-400" : isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : "text-muted-foreground")}>
        <div className={cn("w-2 h-2 rounded-full",
          isPast ? "bg-red-400 animate-pulse" : isCritical ? "bg-red-400 animate-pulse" : isWarning ? "bg-yellow-400 animate-pulse" : "bg-green-400")} />
        {isPast
          ? <span className="text-red-400 font-black">MISSED DEADLINE — RETURN NOW</span>
          : isCritical
          ? <span>⚠️ CUTTING IT CLOSE — Leave in {minsLeft}min</span>
          : <span>Leave by {mustLeave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {minsLeft}min left</span>
        }
        <span className="font-normal text-muted-foreground hidden sm:inline">· {buffer}min buffer</span>
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-black", scoreColor)}>
        Safe return score: {isPast ? '0%' : `${score}%`}
      </div>
      {plan.ship_excursion_price > 0 && plan.diy_budget > 0 && plan.ship_excursion_price > plan.diy_budget && (
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-accent font-bold">Save €{plan.ship_excursion_price - plan.diy_budget}</span>
          <span className="text-muted-foreground">vs ship tour</span>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PLANNER ─────────────────────────────────────────────────────────────
const VIEWS = [
  { key: 'timeline', icon: List, label: 'Timeline' },
  { key: 'map', icon: Map, label: 'Map' },
  { key: 'guide', icon: Star, label: 'Port Guide' },
  { key: 'expenses', icon: ReceiptText, label: 'Expenses' },
  { key: 'transport', icon: Bus, label: 'Transport' },
  { key: 'packing', icon: Luggage, label: 'Packing' },
];

export default function Planner() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('planId');
  const queryClient = useQueryClient();

  // Support single-port quick mode via URL params
  const cityParam = urlParams.get('city');
  const allAboardParam = urlParams.get('allAboard');
  const bufferParam = urlParams.get('buffer');
  const tenderParam = urlParams.get('tender');

  const [setupOpen, setSetupOpen] = useState(!planId && !cityParam);
  const [addOpen, setAddOpen] = useState(false);
  const [refineStop, setRefineStop] = useState(null);
  const [lastPlanResult, setLastPlanResult] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null); // journey[] from plannerEngine
  const [planVariants, setPlanVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [viewMode, setViewMode] = useState('timeline');
  const [activePlanId, setActivePlanId] = useState(planId);
  const [generating, setGenerating] = useState(false);

  const { data: plan } = useQuery({
    queryKey: ['portDayPlan', activePlanId],
    queryFn: () => base44.entities.PortDayPlan.filter({ id: activePlanId }),
    select: d => d?.[0],
    enabled: !!activePlanId,
  });

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['planBlocks', activePlanId],
    queryFn: async () => {
      if (isOffline()) {
        const cached = getCachedPlan(activePlanId);
        if (cached?.blocks) return cached.blocks;
      }
      return base44.entities.PlanBlock.filter({ trip_id: activePlanId }, 'order_index', 200);
    },
    enabled: !!activePlanId,
  });

  // Fetch CruisePort data for the current port city
  const { data: cruisePort } = useQuery({
    queryKey: ['cruisePort', plan?.port_city],
    queryFn: async () => {
      const results = await base44.entities.CruisePort.list('city', 200);
      const city = plan?.port_city?.toLowerCase();
      return results.find(p => p.city?.toLowerCase() === city ||
        city?.includes(p.city?.toLowerCase()) ||
        p.city?.toLowerCase().includes(city)) || null;
    },
    enabled: !!plan?.port_city,
  });

  const createPlan = useMutation({
    mutationFn: (data) => base44.entities.PortDayPlan.create(data),
    onSuccess: (created) => {
      setActivePlanId(created.id);
      queryClient.invalidateQueries({ queryKey: ['portDayPlan'] });
      autoGenerate(created);
    },
  });

  // Auto-create plan from URL params (single-port quick mode)
  const cityParamHandled = useRef(false);
  useEffect(() => {
    if (cityParam && !planId && !cityParamHandled.current) {
      cityParamHandled.current = true;
      createPlan.mutate({
        port_city: cityParam,
        all_aboard_time: allAboardParam || '17:00',
        buffer_minutes: parseInt(bufferParam) || 90,
        tender_delay_minutes: tenderParam === 'true' ? 30 : 0,
        travel_mode: 'first_time',
        group_type: 'couple',
        budget_mode: 'mid_range',
        status: 'planning',
      });
    }
  }, [cityParam]);

  // Auto-generate when an existing plan is loaded with zero blocks
  const autoGenForPlan = useRef(new Set());
  useEffect(() => {
    if (
      plan &&
      activePlanId &&
      !isLoading &&
      !generating &&
      blocks.length === 0 &&
      !autoGenForPlan.current.has(activePlanId)
    ) {
      autoGenForPlan.current.add(activePlanId);
      autoGenerate(plan);
    }
  }, [plan, activePlanId, isLoading, blocks.length, generating]);

  const createBlock = useMutation({
    mutationFn: (data) => base44.entities.PlanBlock.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planBlocks', activePlanId] }),
  });

  const deleteBlock = useMutation({
    mutationFn: (id) => base44.entities.PlanBlock.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['planBlocks', activePlanId] }); toast.success('Stop removed'); },
  });

  const handleApplyPlan = useCallback(async (planResult) => {
    if (!activePlanId || !planResult?.stops) return;
    // Clear existing blocks
    for (const b of blocks) {
      await base44.entities.PlanBlock.delete(b.id);
    }
    // Insert new stops
    const stops = planResult.stops.filter(s => s.type !== 'transit');
    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      await base44.entities.PlanBlock.create({
        trip_id: activePlanId,
        block_type: s.type === 'food' ? 'stop' : s.type === 'arrival' ? 'arrival' : (s.type === 'return' || s.type === 'departure') ? 'departure' : 'stop',
        title: s.title, subtitle: s.locationName || '',
        location: s.address || s.locationName || '',
        duration_minutes: s.durationMinutes || 60,
        cost_estimate: s.estimatedCost || 0,
        order_index: i,
        notes: s.reasonWhyWorthIt || '',
        insider_tip: s.insiderTip || '',
        google_maps_query: s.locationName ? `${s.title} ${plan?.port_city}` : '',
        status: 'planned',
      });
    }
    queryClient.invalidateQueries({ queryKey: ['planBlocks', activePlanId] });
    toast.success(`Plan applied — ${stops.length} stops`);
  }, [activePlanId, blocks, plan?.port_city, queryClient]);

  const autoGenerate = async (planData) => {
    setGenerating(true);
    try {
      // Try hybrid real-data engine first
      let planResult = null;
      let variants = [];
      try {
        const buildResult = await base44.functions.invoke('plannerBuild', { plan: planData });
        variants = buildResult?.data?.plans || [];
        if (variants.length > 0) {
          setPlanVariants(variants);
          setSelectedVariant(variants[0]);
          planResult = variants[0];
        }
      } catch (_) { /* fall through to plannerEngine */ }

      // Fallback: use plannerEngine with generate_variants for rich multi-variant output
      if (!planResult || !planResult.stops?.length) {
        const result = await invokePlanner({ action: 'generate_variants', plan: planData });
        const engineVariants = result?.data?.variants || [];
        if (engineVariants.length > 0) {
          setPlanVariants(engineVariants);
          setSelectedVariant(engineVariants[0]);
          planResult = engineVariants[0];
        } else {
          // Final fallback: single plan
          const singleResult = await invokePlanner({ action: 'build_full_itinerary', plan: planData });
          planResult = singleResult?.data?.plan;
        }
      }

      if (planResult) {
        setLastPlanResult(planResult);
        // Store journey array if present (new format)
        if (planResult.journey?.length > 0) {
          setActiveJourney(planResult.journey);
        }
      }

      // Create blocks from journey[] (new format) or stops[] (legacy)
      const journeyStops = planResult?.journey?.filter(j => j.type !== 'transport' && j.type !== 'arrival' && j.type !== 'departure') || [];
      const legacyStops = planResult?.stops?.filter(s => s.type !== 'transit') || [];
      const allJourneyItems = planResult?.journey || [];
      const stops = journeyStops.length > 0 ? journeyStops : legacyStops;

      for (let i = 0; i < allJourneyItems.length; i++) {
        const j = allJourneyItems[i];
        await base44.entities.PlanBlock.create({
          trip_id: planData.id,
          block_type: j.type === 'transport' ? 'transit'
            : j.type === 'arrival' ? 'arrival'
            : j.type === 'departure' ? 'departure'
            : 'stop',
          title: j.title,
          subtitle: j.subtitle || j.area || '',
          location: j.area || j.subtitle || '',
          duration_minutes: j.durationMin || j.durationMinutes || 0,
          transport_mode: j.mode || '',
          cost_estimate: j.estimatedCostEur || j.estimatedCost || 0,
          order_index: i,
          notes: j.type === 'transport'
            ? (j.instruction || '') + (j.whyThisMode ? ' | Why: ' + j.whyThisMode : '')
            : (j.why || j.reasonWhyWorthIt || ''),
          insider_tip: j.insiderTip || '',
          google_maps_query: j.title ? `${j.title} ${planData.port_city}` : '',
          status: 'planned',
          color_tag: JSON.stringify({
            stopScore: j.stopScore,
            worthItScore: j.worthItScore,
            touristTrapRisk: j.touristTrapRisk,
            alternatives: j.alternatives || [],
            journeyType: j.type,
            instruction: j.instruction,
            whyThisMode: j.whyThisMode,
            alternativeMode: j.alternativeMode,
          }),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['planBlocks', planData.id] });
      const freshBlocks = await base44.entities.PlanBlock.filter({ trip_id: planData.id }, 'order_index', 200);
      cachePlan(planData.id, planData, freshBlocks);
      const count = stops.length || allJourneyItems.filter(j => j.type === 'stop').length;
      if (count) toast.success(`✨ ${count} stops + route generated for ${planData.port_city}`);
    } catch (e) {
      toast.error('Could not generate plan: ' + e.message);
    }
    setGenerating(false);
  };

  const nextOrderIndex = blocks.length > 0 ? Math.max(...blocks.map(b => b.order_index || 0)) + 1 : 0;

  const handleSetup = useCallback((form) => {
    createPlan.mutate({
      port_city: form.port_city, all_aboard_time: form.all_aboard_time,
      buffer_minutes: parseInt(form.buffer_minutes) || 90,
      tender_delay_minutes: parseInt(form.tender_delay_minutes) || 0,
      travel_mode: form.travel_mode, group_type: form.group_type,
      budget_mode: form.budget_mode,
      ship_excursion_price: parseFloat(form.ship_excursion_price) || 0,
      diy_budget: parseFloat(form.diy_budget) || 0,
      status: 'planning',
    });
  }, [createPlan]);

  const handleAcceptStop = useCallback((s) => {
    if (!activePlanId) return;
    createBlock.mutate({
      trip_id: activePlanId, block_type: s.block_type || 'stop',
      title: s.title, subtitle: s.subtitle || '',
      location: s.location || '',
      duration_minutes: s.duration_minutes || 60,
      transport_mode: s.transport_mode || '',
      cost_estimate: s.cost_estimate || 0,
      order_index: nextOrderIndex,
      notes: [s.notes, s.insider_tip ? `💡 ${s.insider_tip}` : ''].filter(Boolean).join(' | ') || '',
      insider_tip: s.insider_tip || '',
      google_maps_query: s.google_maps_query || '',
      walking_distance_from_prev_m: s.walking_distance_from_prev_m || 0,
      status: 'planned',
    });
  }, [activePlanId, nextOrderIndex, createBlock]);

  const stopCount = blocks.filter(b => b.block_type === 'stop').length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/98 backdrop-blur-xl flex-shrink-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-foreground truncate">
              {plan?.port_city || 'Port Day Planner'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {plan ? `All-aboard ${plan.all_aboard_time} · ${stopCount} stops${generating ? ' · Generating…' : ''}` : 'Set up your port day to begin'}
            </p>
          </div>

          {/* View tabs */}
          {activePlanId && (
            <div className="hidden md:flex items-center gap-0.5 rounded-xl border border-border/40 p-0.5 bg-background/60">
              {VIEWS.map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setViewMode(key)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                    viewMode === key ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="w-3 h-3" />{label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {activePlanId && <SharePlanButton plan={plan} />}
            {activePlanId && <ExportPDFButton plan={plan} blocks={blocks} port={null} />}
            {activePlanId && (
              <Button variant="ghost" size="sm" onClick={() => setSetupOpen(true)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <Settings2 className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} disabled={!activePlanId}
              className="h-8 gap-1 text-xs rounded-xl border-border/50">
              <Plus className="w-3.5 h-3.5" /> Add stop
            </Button>
          </div>
        </div>

        {/* Safety strip */}
        {plan && (
          <div className="px-4 py-2 border-t border-border/20 bg-background/60">
            <SafetyStrip plan={plan} />
          </div>
        )}
      </header>

      {/* Body — 3 col: timeline | AI chat always visible */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {!activePlanId ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center shadow-2xl shadow-accent/10">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">Plan your port day with AI</h2>
                <p className="text-muted-foreground max-w-xs leading-relaxed">Enter your port, all-aboard time, and travel style. AI builds your full itinerary in seconds.</p>
              </div>
              <Button onClick={() => setSetupOpen(true)} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-black px-10 rounded-2xl h-13 shadow-xl shadow-accent/25">
                <Sparkles className="w-5 h-5" /> Get started
              </Button>
            </div>
          ) : generating && blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground mb-1">Building your {plan?.port_city} itinerary…</p>
                <p className="text-sm text-muted-foreground">AI is crafting your personalised day plan</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 0.15, 0.3].map(d => <div key={d} className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${d}s` }} />)}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-4">
              {viewMode === 'timeline' && (
                <>
                  <PlanHeroSummary plan={plan} blocks={blocks} planResult={lastPlanResult} />
                  {lastPlanResult && (
                    <>
                      <PlanIntelligenceCard planResult={lastPlanResult} />
                      <RouteOpportunities planResult={lastPlanResult} />
                    </>
                  )}
                  <JourneyTimeline
                    journey={activeJourney}
                    blocks={blocks}
                    plan={plan}
                    isLoading={isLoading}
                    onDelete={(id) => deleteBlock.mutate(id)}
                    onAiRefine={(b) => setRefineStop(b)}
                  />
                </>
              )}
              {viewMode === 'map' && <PortMap city={plan?.port_city} planBlocks={blocks} className="mt-2" />}
                {viewMode === 'guide' && <PortIntelligencePanel port={cruisePort} portCity={plan?.port_city} />}
                {viewMode === 'expenses' && <ExpenseTracker planId={activePlanId} diyBudget={plan?.diy_budget || 0} />}
                {viewMode === 'transport' && <TransportHub plan={plan} />}
                {viewMode === 'packing' && <PackingList plan={plan} blocks={blocks} />}
            </div>
          )}
        </div>

        {/* AI Planning Engine Panel */}
        {activePlanId && (
          <div className="hidden md:flex w-80 flex-shrink-0 flex-col border-l border-border/30 overflow-hidden">
            <PlannerAiPanel
              plan={plan}
              blocks={blocks}
              cruisePort={cruisePort}
              onApplyPlan={handleApplyPlan}
              onAcceptStop={handleAcceptStop}
              planVariants={planVariants}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => {
                setSelectedVariant(v);
                setLastPlanResult(v);
                if (v.journey?.length > 0) setActiveJourney(v.journey);
                handleApplyPlan(v);
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile AI FAB */}
      {activePlanId && (
        <div className="md:hidden fixed bottom-5 right-5 z-40">
          <Button className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-2xl shadow-accent/40 p-0">
            <Sparkles className="w-6 h-6" />
          </Button>
        </div>
      )}

      <PlanLaunchFlow open={setupOpen && !activePlanId} onComplete={(form) => { handleSetup(form); setSetupOpen(false); }} />
      {activePlanId && (
        <AddBlockDialog open={addOpen} onOpenChange={setAddOpen} onSave={(data) => createBlock.mutate(data)} tripId={activePlanId} nextOrderIndex={nextOrderIndex} />
      )}
    </div>
  );
}