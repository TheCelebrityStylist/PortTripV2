import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import {
  Ship, Plus, MapPin, Calendar, ChevronRight, Anchor, Sparkles,
  ArrowLeft, Trash2, Edit2, X, Check, Clock, TrendingDown, Crown,
  BarChart2, Settings, Navigation, Luggage, FileText, Share2, AlertTriangle,
  Globe, Zap, Menu, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Add/Edit Cruise Dialog ───────────────────────────────────────────────────
function CruiseDialog({ open, onOpenChange, onSave, initial }) {
  const empty = { name: '', cruise_line: '', ship_name: '', home_port: '', departure_date: '', return_date: '', cabin_number: '', booking_reference: '', ports: [] };
  const [form, setForm] = useState(initial || empty);
  const [newPort, setNewPort] = useState({ city: '', date: '', all_aboard_time: '17:00', tender: false });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addPort = () => {
    if (!newPort.city.trim() || !newPort.date) return;
    setForm(p => ({ ...p, ports: [...(p.ports || []), { ...newPort, id: Date.now() }] }));
    setNewPort({ city: '', date: '', all_aboard_time: '17:00', tender: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Ship className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{initial ? 'Edit cruise' : 'Add your cruise'}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Add your ship & ports — AI plans each day automatically</p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Cruise nickname</Label>
              <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="e.g. Mediterranean Summer 2025" value={form.name} onChange={e => up('name', e.target.value)} autoFocus />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cruise line</Label>
              <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="MSC, Royal Caribbean…" value={form.cruise_line} onChange={e => up('cruise_line', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ship name</Label>
              <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="MSC Virtuosa…" value={form.ship_name} onChange={e => up('ship_name', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Departure date</Label>
              <Input type="date" className="mt-1.5 bg-background/60 border-border/60 rounded-xl" value={form.departure_date?.split('T')[0] || ''} onChange={e => up('departure_date', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Return date</Label>
              <Input type="date" className="mt-1.5 bg-background/60 border-border/60 rounded-xl" value={form.return_date?.split('T')[0] || ''} onChange={e => up('return_date', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Home port / embarkation</Label>
              <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="Barcelona, Southampton…" value={form.home_port} onChange={e => up('home_port', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cabin number</Label>
              <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="12045" value={form.cabin_number} onChange={e => up('cabin_number', e.target.value)} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Port Stops</h3>
            {(form.ports || []).length > 0 && (
              <div className="space-y-2 mb-3">
                {form.ports.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{p.city}</p>
                      <p className="text-xs text-muted-foreground">{p.date ? format(new Date(p.date), 'EEE d MMM') : ''} · All-aboard {p.all_aboard_time}{p.tender ? ' · Tender' : ''}</p>
                    </div>
                    <button onClick={() => setForm(prev => ({ ...prev, ports: prev.ports.filter((_, j) => j !== i) }))} className="w-6 h-6 rounded-lg hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-xl border border-dashed border-border/50 p-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Add a port stop</p>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4"><Input className="h-9 text-sm bg-background/60 rounded-lg" placeholder="Port city" value={newPort.city} onChange={e => setNewPort(p => ({ ...p, city: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addPort()} /></div>
                <div className="col-span-4"><Input type="date" className="h-9 text-sm bg-background/60 rounded-lg" value={newPort.date} onChange={e => setNewPort(p => ({ ...p, date: e.target.value }))} /></div>
                <div className="col-span-2"><Input type="time" className="h-9 text-sm bg-background/60 rounded-lg" value={newPort.all_aboard_time} onChange={e => setNewPort(p => ({ ...p, all_aboard_time: e.target.value }))} /></div>
                <div className="col-span-2">
                  <Button onClick={addPort} disabled={!newPort.city.trim() || !newPort.date} className="h-9 w-full bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 rounded-lg text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={newPort.tender} onChange={e => setNewPort(p => ({ ...p, tender: e.target.checked }))} className="rounded" />
                Tender port (adds 30min buffer)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => { onSave(form); onOpenChange(false); }} disabled={!form.name.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl px-6">
              <Check className="w-4 h-4" /> {initial ? 'Save changes' : 'Create cruise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Port Planning Card ───────────────────────────────────────────────────────
function PortPlanCard({ port, cruiseId, ports, onUpdateCruise }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const daysUntil = port.date ? differenceInDays(new Date(port.date), new Date()) : null;

  const handleOpen = async () => {
    if (port.plan_id) {
      navigate(`/planner?planId=${port.plan_id}&cruiseId=${cruiseId}`);
      return;
    }
    const plan = await base44.entities.PortDayPlan.create({
      port_city: port.city,
      all_aboard_time: port.all_aboard_time || '17:00',
      buffer_minutes: 90,
      tender_delay_minutes: port.tender ? 30 : 0,
      status: 'planning',
    });
    const updated = ports.map(p => (p.city === port.city && p.date === port.date) ? { ...p, plan_id: plan.id } : p);
    await base44.entities.Cruise.update(cruiseId, { ports: updated });
    queryClient.invalidateQueries({ queryKey: ['cruises'] });
    navigate(`/planner?planId=${plan.id}&cruiseId=${cruiseId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleOpen}
      className={cn(
        "group rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
        port.plan_id ? "border-accent/25 bg-accent/5 hover:border-accent/40" : "border-border/30 bg-card/40 hover:border-accent/20 hover:bg-card/60"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-black text-foreground group-hover:text-accent transition-colors">{port.city}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {port.date ? format(new Date(port.date), 'EEE, d MMM') : 'Date TBD'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {port.tender && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Tender</span>}
          {port.plan_id
            ? <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-accent" /></div>
            : <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/15 transition-colors"><Sparkles className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" /></div>
          }
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />All-aboard {port.all_aboard_time}
          </span>
        </div>
        {daysUntil !== null && (
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
            daysUntil <= 7 ? "text-accent bg-accent/10" : "text-muted-foreground bg-secondary"
          )}>
            {daysUntil > 0 ? `${daysUntil}d away` : daysUntil === 0 ? 'Today!' : 'Past'}
          </span>
        )}
      </div>

      {port.plan_id ? (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs font-bold text-accent">View & edit plan</span>
          <ChevronRight className="w-3.5 h-3.5 text-accent" />
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tap to plan with AI</span>
          <div className="flex items-center gap-1 text-xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-3 h-3" /> Plan now
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Cruise Panel ─────────────────────────────────────────────────────────────
function CruisePanel({ cruise, onEdit, onDelete }) {
  const nights = cruise.departure_date && cruise.return_date
    ? differenceInDays(new Date(cruise.return_date), new Date(cruise.departure_date)) : null;
  const daysUntil = cruise.departure_date ? differenceInDays(new Date(cruise.departure_date), new Date()) : null;
  const plannedPorts = (cruise.ports || []).filter(p => p.plan_id).length;
  const queryClient = useQueryClient();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cruise header */}
      <div className="border-b border-border/30 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-foreground">{cruise.name}</h2>
              {daysUntil !== null && daysUntil > 0 && (
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{daysUntil} days to go</span>
              )}
              {daysUntil !== null && daysUntil <= 0 && nights && daysUntil > -nights && (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">On cruise now!</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {cruise.ship_name && <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{cruise.cruise_line && `${cruise.cruise_line} · `}{cruise.ship_name}</span>}
              {cruise.departure_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(cruise.departure_date), 'd MMM yyyy')}{cruise.return_date && ` → ${format(new Date(cruise.return_date), 'd MMM')}`}</span>}
              {nights && <span>{nights} nights</span>}
              {cruise.home_port && <span className="flex items-center gap-1"><Anchor className="w-3 h-3" />{cruise.home_port}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onEdit(cruise)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(cruise.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/20">
          <div className="text-center">
            <p className="text-xl font-black text-foreground">{cruise.ports?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ports</p>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center">
            <p className="text-xl font-black text-accent">{plannedPorts}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Planned</p>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center">
            <p className="text-xl font-black text-foreground">{(cruise.ports?.length || 0) - plannedPorts}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">To plan</p>
          </div>
          {plannedPorts > 0 && (
            <>
              <div className="w-px h-8 bg-border/40" />
              <div className="text-center">
                <p className="text-xl font-black text-green-400">~€{plannedPorts * 80}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Est. savings</p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        {(cruise.ports?.length || 0) > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Planning progress</span>
              <span>{plannedPorts}/{cruise.ports?.length} ports</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(plannedPorts / (cruise.ports?.length || 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-accent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Port cards */}
      <div className="px-6 py-5">
        {(!cruise.ports || cruise.ports.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-accent/50" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1">No ports added yet</p>
              <p className="text-xs text-muted-foreground">Edit the cruise to add your port stops</p>
            </div>
            <Button size="sm" onClick={() => onEdit(cruise)} variant="outline" className="gap-2 rounded-xl border-border/60">
              <Edit2 className="w-3.5 h-3.5" /> Add ports
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Port stops</h3>
              <Link to="/ports" className="text-xs text-accent hover:underline flex items-center gap-1">
                <Globe className="w-3 h-3" /> Browse port guides
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {cruise.ports.map((port, i) => (
                <PortPlanCard key={i} port={port} cruiseId={cruise.id} ports={cruise.ports} onUpdateCruise={() => queryClient.invalidateQueries({ queryKey: ['cruises'] })} />
              ))}
            </div>
          </>
        )}

        {/* Quick plan CTA at bottom */}
        <div className="mt-6 pt-5 border-t border-border/20">
          <Link to="/planner">
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-accent/30 bg-accent/5 hover:bg-accent/8 p-5 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Quick plan a new port</p>
                <p className="text-xs text-muted-foreground">Plan any port without adding it to this cruise</p>
              </div>
              <ChevronRight className="w-4 h-4 text-accent ml-auto" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editCruise, setEditCruise] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: cruises = [], isLoading } = useQuery({
    queryKey: ['cruises'],
    queryFn: () => base44.entities.Cruise.list('-created_date', 50),
    onSuccess: (data) => { if (data.length > 0 && !selectedId) setSelectedId(data[0].id); },
  });

  const selected = cruises.find(c => c.id === selectedId) || cruises[0] || null;

  const createCruise = useMutation({
    mutationFn: (data) => base44.entities.Cruise.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] });
      setSelectedId(created.id);
      toast.success('Cruise created!');
    },
  });

  const updateCruise = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.Cruise.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cruises'] }); toast.success('Cruise updated!'); },
  });

  const deleteCruise = useMutation({
    mutationFn: (id) => base44.entities.Cruise.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] });
      if (selectedId === id) setSelectedId(null);
      toast.success('Cruise removed');
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state
  if (cruises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                <Anchor className="w-4 h-4 text-accent-foreground" />
              </div>
            </Link>
            <span className="font-black text-foreground">PortTrip</span>
          </div>
          <Link to="/ports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Port Guides</Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/10">
              <Ship className="w-12 h-12 text-accent" />
            </div>
            <h1 className="font-display text-4xl font-black text-foreground mb-3">Welcome to PortTrip</h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-8">
              Add your cruise and let AI plan every port day — saving you time, money, and the stress of never missing all-aboard.
            </p>
            <Button onClick={() => setAddOpen(true)} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-black px-10 rounded-2xl h-14 shadow-xl shadow-accent/25">
              <Ship className="w-5 h-5" /> Add my first cruise
            </Button>
            <div className="mt-4">
              <Link to="/planner" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-1">
                Or plan a single port day without a cruise <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
        <CruiseDialog open={addOpen} onOpenChange={setAddOpen} onSave={(d) => createCruise.mutate(d)} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="border-b border-border/30 px-5 py-3 flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <Link to="/">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Anchor className="w-4 h-4 text-accent-foreground" />
            </div>
          </Link>
          <span className="font-black text-foreground hidden sm:block">PortTrip</span>
          <div className="w-px h-4 bg-border/40 hidden sm:block" />
          <span className="text-sm text-muted-foreground hidden sm:block">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ports">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Port Guides
            </Button>
          </Link>
          <Link to="/planner">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Quick Plan
            </Button>
          </Link>
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-1.5 font-bold text-xs h-8">
            <Plus className="w-3.5 h-3.5" /> Add cruise
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — cruise list */}
        <div className={cn("border-r border-border/30 bg-card/30 flex flex-col flex-shrink-0 transition-all duration-300", sidebarOpen ? "w-56" : "w-0 overflow-hidden")}>
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Cruises</span>
            <span className="text-[10px] text-muted-foreground">{cruises.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {cruises.map(c => {
              const isSelected = (selected?.id === c.id);
              const daysUntil = c.departure_date ? differenceInDays(new Date(c.departure_date), new Date()) : null;
              const plannedCount = (c.ports || []).filter(p => p.plan_id).length;
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)}
                  className={cn("w-full text-left rounded-xl px-3 py-2.5 transition-all group", isSelected ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Ship className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{c.name}</span>
                  </div>
                  <div className="text-[10px] opacity-70 pl-5">
                    {c.ports?.length || 0} ports · {plannedCount} planned
                    {daysUntil !== null && daysUntil > 0 && ` · ${daysUntil}d`}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-border/20">
            <button onClick={() => setAddOpen(true)} className="w-full rounded-xl border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2 hover:border-accent/40 hover:text-accent transition-all">
              <Plus className="w-3 h-3" /> New cruise
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selected ? (
            <CruisePanel
              cruise={selected}
              onEdit={(c) => setEditCruise(c)}
              onDelete={(id) => deleteCruise.mutate(id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a cruise from the sidebar
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CruiseDialog open={addOpen} onOpenChange={setAddOpen} onSave={(d) => createCruise.mutate(d)} />
      {editCruise && (
        <CruiseDialog
          open={!!editCruise}
          onOpenChange={(v) => !v && setEditCruise(null)}
          initial={editCruise}
          onSave={(d) => updateCruise.mutate({ id: editCruise.id, ...d })}
        />
      )}
    </div>
  );
}