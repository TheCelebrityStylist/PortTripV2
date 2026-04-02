import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import {
  Ship, Plus, MapPin, Calendar, ChevronRight, Anchor, Sparkles,
  Clock, ArrowLeft, Trash2, Edit2, X, Check, Navigation, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CruiseImportModal from '../components/cruise/CruiseImportModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const FLAG_MAP = {
  es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷', gr: '🇬🇷', hr: '🇭🇷', no: '🇳🇴',
  pt: '🇵🇹', tr: '🇹🇷', mt: '🇲🇹', me: '🇲🇪', nl: '🇳🇱', de: '🇩🇪',
  gb: '🇬🇧', us: '🇺🇸', bs: '🇧🇸', mx: '🇲🇽', bb: '🇧🇧',
};

// ─── Add/Edit Cruise Dialog ───────────────────────────────────────────────────
function CruiseDialog({ open, onOpenChange, onSave, initial }) {
  const empty = {
    name: '', cruise_line: '', ship_name: '', home_port: '',
    departure_date: '', return_date: '', cabin_number: '',
    booking_reference: '', notes: '',
    ports: [],
  };
  const [form, setForm] = useState(initial || empty);
  const [newPort, setNewPort] = useState({ city: '', date: '', all_aboard_time: '17:00', tender: false });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addPort = () => {
    if (!newPort.city.trim() || !newPort.date) return;
    setForm(p => ({ ...p, ports: [...(p.ports || []), { ...newPort, id: Date.now() }] }));
    setNewPort({ city: '', date: '', all_aboard_time: '17:00', tender: false });
  };

  const removePort = (id) => setForm(p => ({ ...p, ports: p.ports.filter(x => x.id !== id) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Ship className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {initial ? 'Edit cruise' : 'Add your cruise'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Set up your ship & ports — AI plans each day automatically</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Cruise basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cruise Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Cruise name / nickname</Label>
                <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="e.g. Mediterranean 2025" value={form.name} onChange={e => up('name', e.target.value)} />
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
                <Label className="text-xs text-muted-foreground">Home port</Label>
                <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="Barcelona, Southampton…" value={form.home_port} onChange={e => up('home_port', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cabin number</Label>
                <Input className="mt-1.5 bg-background/60 border-border/60 rounded-xl" placeholder="12045" value={form.cabin_number} onChange={e => up('cabin_number', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Departure date</Label>
                <Input type="date" className="mt-1.5 bg-background/60 border-border/60 rounded-xl" value={form.departure_date?.split('T')[0] || ''} onChange={e => up('departure_date', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Return date</Label>
                <Input type="date" className="mt-1.5 bg-background/60 border-border/60 rounded-xl" value={form.return_date?.split('T')[0] || ''} onChange={e => up('return_date', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ports */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Port Stops</h3>

            {/* Existing ports */}
            {(form.ports || []).length > 0 && (
              <div className="space-y-2">
                {form.ports.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{p.city}</p>
                      <p className="text-xs text-muted-foreground">{p.date ? format(new Date(p.date), 'EEE d MMM') : ''} · All-aboard {p.all_aboard_time}{p.tender ? ' · Tender' : ''}</p>
                    </div>
                    <button onClick={() => removePort(p.id || i)} className="w-6 h-6 rounded-lg hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add port row */}
            <div className="rounded-xl border border-dashed border-border/50 p-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Add a port stop</p>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Input className="h-9 text-sm bg-background/60 border-border/60 rounded-lg" placeholder="Port city" value={newPort.city} onChange={e => setNewPort(p => ({ ...p, city: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addPort()} />
                </div>
                <div className="col-span-4">
                  <Input type="date" className="h-9 text-sm bg-background/60 border-border/60 rounded-lg" value={newPort.date} onChange={e => setNewPort(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Input type="time" className="h-9 text-sm bg-background/60 border-border/60 rounded-lg" value={newPort.all_aboard_time} onChange={e => setNewPort(p => ({ ...p, all_aboard_time: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Button onClick={addPort} disabled={!newPort.city.trim() || !newPort.date} className="h-9 w-full bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 rounded-lg text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={newPort.tender} onChange={e => setNewPort(p => ({ ...p, tender: e.target.checked }))} className="rounded" />
                Tender port (add 30min buffer)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => { onSave(form); onOpenChange(false); }}
              disabled={!form.name.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl px-6"
            >
              <Check className="w-4 h-4" /> {initial ? 'Save changes' : 'Create cruise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cruise Card ──────────────────────────────────────────────────────────────
function CruiseCard({ cruise, onDelete, onEdit }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const nights = cruise.departure_date && cruise.return_date
    ? differenceInDays(new Date(cruise.return_date), new Date(cruise.departure_date))
    : null;

  const daysUntil = cruise.departure_date
    ? differenceInDays(new Date(cruise.departure_date), new Date())
    : null;

  const handlePortClick = async (port) => {
    // Find or create a PortDayPlan for this port
    if (port.plan_id) {
      navigate(`/planner?planId=${port.plan_id}&cruiseId=${cruise.id}`);
      return;
    }
    // Create a new plan
    const plan = await base44.entities.PortDayPlan.create({
      port_city: port.city,
      all_aboard_time: port.all_aboard_time || '17:00',
      buffer_minutes: 90,
      tender_delay_minutes: port.tender ? 30 : 0,
      status: 'planning',
      ai_generated: false,
    });
    // Update cruise ports with plan_id
    const updatedPorts = cruise.ports.map(p =>
      (p.city === port.city && p.date === port.date) ? { ...p, plan_id: plan.id } : p
    );
    await base44.entities.Cruise.update(cruise.id, { ports: updatedPorts });
    queryClient.invalidateQueries({ queryKey: ['cruises'] });
    navigate(`/planner?planId=${plan.id}&cruiseId=${cruise.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/40 bg-card/70 overflow-hidden hover:border-accent/20 transition-all"
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Ship className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground">{cruise.name}</h3>
              {cruise.ship_name && (
                <p className="text-sm text-muted-foreground">{cruise.cruise_line && `${cruise.cruise_line} · `}{cruise.ship_name}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(cruise)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(cruise.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {cruise.departure_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(cruise.departure_date), 'd MMM yyyy')}
                {cruise.return_date && ` → ${format(new Date(cruise.return_date), 'd MMM')}`}
              </span>
            )}
            {nights && <span className="text-xs text-muted-foreground">{nights} nights</span>}
            {cruise.ports?.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />{cruise.ports.length} ports
              </span>
            )}
            {daysUntil !== null && daysUntil > 0 && (
              <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {daysUntil}d to go
              </span>
            )}
            {daysUntil !== null && daysUntil <= 0 && daysUntil > -nights && (
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                On cruise now!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ports timeline */}
      {cruise.ports?.length > 0 && (
        <div className="border-t border-border/30">
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-background/30 transition-colors"
          >
            <span className="text-xs font-semibold text-muted-foreground">View {cruise.ports.length} port stops</span>
            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 space-y-2">
                  {cruise.ports.map((port, i) => (
                    <button
                      key={i}
                      onClick={() => handlePortClick(port)}
                      className="w-full flex items-center gap-3 rounded-xl border border-border/30 bg-background/40 px-4 py-3 hover:border-accent/30 hover:bg-accent/5 transition-all group text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">{port.city}</p>
                        <p className="text-xs text-muted-foreground">
                          {port.date ? format(new Date(port.date), 'EEE d MMM') : 'Date TBD'}
                          {' · '}All-aboard {port.all_aboard_time}
                          {port.tender && ' · Tender'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {port.plan_id ? (
                          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Planned</span>
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Plan day →</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* No ports empty state */}
      {(!cruise.ports || cruise.ports.length === 0) && (
        <div className="border-t border-border/30 px-5 py-4 text-center">
          <p className="text-xs text-muted-foreground">No port stops added yet</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyCruises() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editCruise, setEditCruise] = useState(null);

  const { data: cruises = [], isLoading } = useQuery({
    queryKey: ['cruises'],
    queryFn: () => base44.entities.Cruise.list('-created_date', 50),
  });

  const createCruise = useMutation({
    mutationFn: (data) => base44.entities.Cruise.create(data),
    onSuccess: async (created) => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] });
      toast.success('Cruise added! Generating starter plans…');
      // Auto-generate PortDayPlan for each port
      if (created.ports?.length) {
        const updatedPorts = [];
        for (const port of created.ports) {
          try {
            const plan = await base44.entities.PortDayPlan.create({
              port_city: port.city,
              all_aboard_time: port.all_aboard_time || '17:00',
              buffer_minutes: 90,
              tender_delay_minutes: port.tender ? 30 : 0,
              travel_mode: 'first_time',
              status: 'planning',
              ai_generated: false,
            });
            updatedPorts.push({ ...port, plan_id: plan.id });
            // Kick off auto-generation async (don't await — let it run in background)
            base44.functions.invoke('plannerEngine', {
              action: 'build_full_itinerary',
              plan: { port_city: port.city, all_aboard_time: port.all_aboard_time || '17:00', buffer_minutes: 90, tender_delay_minutes: port.tender ? 30 : 0, travel_mode: 'first_time', group_type: 'couple', budget_mode: 'mid_range', id: plan.id },
            }).then(async (res) => {
              const planResult = res?.data?.plan;
              if (!planResult?.journey?.length) return;
              const items = planResult.journey || [];
              for (let i = 0; i < items.length; i++) {
                const j = items[i];
                await base44.entities.PlanBlock.create({
                  trip_id: plan.id, block_type: j.type === 'transport' ? 'transit' : j.type === 'arrival' ? 'arrival' : j.type === 'departure' ? 'departure' : 'stop',
                  title: j.title, subtitle: j.subtitle || '', location: j.area || '',
                  duration_minutes: j.durationMin || 0, transport_mode: j.mode || '',
                  cost_estimate: j.estimatedCostEur || 0, order_index: i,
                  notes: j.why || j.instruction || '', insider_tip: j.insiderTip || '',
                  google_maps_query: j.title ? `${j.title} ${port.city}` : '',
                  status: 'planned',
                  color_tag: JSON.stringify({ stopScore: j.stopScore, worthItScore: j.worthItScore, touristTrapRisk: j.touristTrapRisk, alternatives: j.alternatives || [], journeyType: j.type, instruction: j.instruction, whyThisMode: j.whyThisMode }),
                });
              }
              await base44.entities.PortDayPlan.update(plan.id, { ai_generated: true, status: 'ready' });
            }).catch(() => {});
          } catch (_) {
            updatedPorts.push(port);
          }
        }
        await base44.entities.Cruise.update(created.id, { ports: updatedPorts });
        queryClient.invalidateQueries({ queryKey: ['cruises'] });
        toast.success(`${created.ports.length} port days queued for planning!`);
      }
    },
  });

  const updateCruise = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.Cruise.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cruises'] }); toast.success('Cruise updated!'); },
  });

  const deleteCruise = useMutation({
    mutationFn: (id) => base44.entities.Cruise.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cruises'] }); toast.success('Cruise removed'); },
  });

  const upcomingCruises = cruises.filter(c => !c.return_date || new Date(c.return_date) >= new Date());
  const pastCruises = cruises.filter(c => c.return_date && new Date(c.return_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-foreground">My Cruises</h1>
              <p className="text-xs text-muted-foreground">{cruises.length} cruise{cruises.length !== 1 ? 's' : ''} · {cruises.reduce((s, c) => s + (c.ports?.length || 0), 0)} ports planned</p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-9 text-sm">
            <Plus className="w-4 h-4" /> Add cruise
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {isLoading && (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-32 rounded-2xl bg-card/40 animate-pulse" />)}
          </div>
        )}

        {!isLoading && cruises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center">
              <Ship className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Plan your first cruise</h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Upload your booking confirmation, paste your itinerary, or build it manually — AI generates each port day automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button onClick={() => setAddOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold px-8 rounded-xl h-12">
                <Upload className="w-4 h-4" /> Upload / import itinerary
              </Button>
              <button onClick={() => setAddOpen(true)} className="text-xs text-muted-foreground hover:text-accent transition-colors">
                or add manually
              </button>
            </div>
          </div>
        )}

        {upcomingCruises.length > 0 && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Upcoming</p>
            <div className="space-y-4">
              {upcomingCruises.map(c => (
                <CruiseCard key={c.id} cruise={c}
                  onDelete={(id) => deleteCruise.mutate(id)}
                  onEdit={(c) => setEditCruise(c)}
                />
              ))}
            </div>
          </section>
        )}

        {pastCruises.length > 0 && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Past cruises</p>
            <div className="space-y-4">
              {pastCruises.map(c => (
                <CruiseCard key={c.id} cruise={c}
                  onDelete={(id) => deleteCruise.mutate(id)}
                  onEdit={(c) => setEditCruise(c)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <CruiseImportModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaveCruise={(d) => createCruise.mutate(d)}
        onSinglePort={({ city, allAboard, buffer, tender }) => {
          navigate(`/planner?city=${encodeURIComponent(city)}&allAboard=${allAboard}&buffer=${buffer}&tender=${tender}`);
        }}
      />
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