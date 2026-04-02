import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, ChevronLeft, MapPin, Clock, Shield,
  Users, Utensils, DollarSign, Zap, Crown, Camera, Check,
  Navigation, Ship, Star, TrendingDown, Heart, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const GROUP_OPTIONS = [
  { value: 'solo', emoji: '🧍', label: 'Solo', desc: 'Just me' },
  { value: 'couple', emoji: '👫', label: 'Couple', desc: 'Two of us' },
  { value: 'family_kids', emoji: '👨‍👩‍👧', label: 'Family', desc: 'Kids in tow' },
  { value: 'seniors', emoji: '🧓', label: 'Seniors', desc: 'Slower pace' },
  { value: 'group', emoji: '👥', label: 'Group', desc: '4+ friends' },
];

const INTENT_OPTIONS = [
  { value: 'first_time', emoji: '🗺️', label: 'First-timer power day', desc: 'Hit the icons, miss nothing' },
  { value: 'culture', emoji: '🏛️', label: 'Culture & history', desc: 'Deep dives, not selfie spots' },
  { value: 'food', emoji: '🍽️', label: 'Food-first day', desc: 'Eat like a local does' },
  { value: 'hidden_gems', emoji: '💎', label: 'Hidden gems', desc: 'Avoid the crowds entirely' },
  { value: 'relaxation', emoji: '☀️', label: 'Relaxed & scenic', desc: 'No rushing, high reward' },
  { value: 'nature', emoji: '🌿', label: 'Nature & outdoors', desc: 'Landscapes over landmarks' },
  { value: 'luxury', emoji: '👑', label: 'Luxury port day', desc: 'Premium experiences only' },
  { value: 'family_friendly', emoji: '🎪', label: 'Family-easy day', desc: 'Fun for all ages, low stress' },
  { value: 'cruise_safe', emoji: '⚓', label: 'Cruise-safe & stress-free', desc: 'Maximum buffer, zero risk' },
  { value: 'max_sights', emoji: '⚡', label: 'Max out the day', desc: 'Efficient, packed, memorable' },
];

const STEPS = [
  { id: 'context', label: 'Your port', number: 1 },
  { id: 'who', label: 'Who\'s going', number: 2 },
  { id: 'intent', label: 'Day intent', number: 3 },
  { id: 'priorities', label: 'Priorities', number: 4 },
  { id: 'finish', label: 'Final details', number: 5 },
];

function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.id} className={cn(
          'rounded-full transition-all duration-300',
          i === current ? 'w-6 h-2 bg-accent' : i < current ? 'w-2 h-2 bg-accent/50' : 'w-2 h-2 bg-border/50'
        )} />
      ))}
    </div>
  );
}

function ChipGrid({ options, value, onChange, multi = false }) {
  const selected = multi ? (Array.isArray(value) ? value : []) : value;
  const toggle = (v) => {
    if (multi) {
      onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
    } else {
      onChange(v);
    }
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => {
        const isSelected = multi ? selected.includes(opt.value) : selected === opt.value;
        return (
          <button key={opt.value} onClick={() => toggle(opt.value)}
            className={cn(
              'relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              isSelected
                ? 'border-accent/60 bg-accent/10 shadow-sm shadow-accent/10'
                : 'border-border/30 bg-card/40 hover:border-accent/30 hover:bg-card/70'
            )}>
            <span className="text-xl flex-shrink-0">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold leading-tight', isSelected ? 'text-accent' : 'text-foreground')}>{opt.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{opt.desc}</p>
            </div>
            {isSelected && (
              <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-accent-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SliderToggle({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-[10px] text-accent font-bold">{value > 50 ? rightLabel : value < 50 ? leftLabel : 'Balanced'}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground/60 w-16 text-right">{leftLabel}</span>
        <input
          type="range" min="0" max="100" step="10" value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="flex-1 accent-accent h-1.5 cursor-pointer"
        />
        <span className="text-[10px] text-muted-foreground/60 w-16">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function PlanLaunchFlow({ open, onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    port_city: '', all_aboard_time: '17:00', buffer_minutes: 90,
    tender_delay_minutes: 0, dock_time: '08:00',
    group_type: 'couple', travel_mode: 'first_time',
    budget_mode: 'mid_range', ship_excursion_price: '',
    diy_budget: '', must_see: '', avoid: '',
    priorities: { sights: 50, cost: 50, walking: 50, tourist: 50 },
  });

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const upP = (k, v) => setForm(p => ({ ...p, priorities: { ...p.priorities, [k]: v } }));

  const canAdvance = () => {
    if (step === 0) return form.port_city.trim().length > 1 && form.all_aboard_time;
    return true;
  };

  const handleFinish = () => {
    const budgetMode = form.priorities.cost < 35 ? 'luxury' : form.priorities.cost > 65 ? 'budget' : 'mid_range';
    onComplete({
      port_city: form.port_city.trim(),
      all_aboard_time: form.all_aboard_time,
      dock_time: form.dock_time || '08:00',
      buffer_minutes: parseInt(form.buffer_minutes) || 90,
      tender_delay_minutes: parseInt(form.tender_delay_minutes) || 0,
      group_type: form.group_type,
      travel_mode: form.travel_mode,
      budget_mode: budgetMode,
      ship_excursion_price: parseFloat(form.ship_excursion_price) || 0,
      diy_budget: parseFloat(form.diy_budget) || 0,
      must_see: form.must_see,
      avoid: form.avoid,
      priorities: form.priorities,
      status: 'planning',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.04)_0%,transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-3xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">PortTrip AI Planner</p>
                  <p className="text-[10px] text-muted-foreground">Cruise-intelligent · Not generic</p>
                </div>
              </div>
              <StepDots current={step} />
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >

                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 1 of 5</p>
                      <h2 className="text-xl font-black text-foreground leading-tight mb-1">Where are you docking?</h2>
                      <p className="text-xs text-muted-foreground">We'll optimize every minute of your limited port time.</p>
                    </div>
                    <div>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          autoFocus
                          className="pl-10 h-13 text-base bg-background/60 border-border/40 rounded-2xl font-bold"
                          placeholder="Barcelona, Santorini, Dubrovnik…"
                          value={form.port_city}
                          onChange={e => up('port_city', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Dock time</label>
                        <Input type="time" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" value={form.dock_time} onChange={e => up('dock_time', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">All-aboard ⚠️</label>
                        <Input type="time" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm font-bold text-accent" value={form.all_aboard_time} onChange={e => up('all_aboard_time', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Return buffer (min)</label>
                        <Input type="number" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" value={form.buffer_minutes} onChange={e => up('buffer_minutes', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Tender delay (min)</label>
                        <Input type="number" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" value={form.tender_delay_minutes} onChange={e => up('tender_delay_minutes', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-accent/5 border border-accent/15 px-3 py-2.5">
                      <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        <span className="text-accent font-bold">Cruise-first logic:</span> Every stop, every transit, every return time is built around your all-aboard deadline. We don't do generic trip planning.
                      </p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 2 of 5</p>
                      <h2 className="text-xl font-black text-foreground leading-tight mb-1">Who's joining you?</h2>
                      <p className="text-xs text-muted-foreground">We tailor stop selection, pacing, and transit choices to your group.</p>
                    </div>
                    <ChipGrid options={GROUP_OPTIONS} value={form.group_type} onChange={v => up('group_type', v)} />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 3 of 5</p>
                      <h2 className="text-xl font-black text-foreground leading-tight mb-1">What kind of day?</h2>
                      <p className="text-xs text-muted-foreground">This shapes your entire itinerary — not just a filter.</p>
                    </div>
                    <ChipGrid options={INTENT_OPTIONS} value={form.travel_mode} onChange={v => up('travel_mode', v)} />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 4 of 5</p>
                      <h2 className="text-xl font-black text-foreground leading-tight mb-1">Set your priorities</h2>
                      <p className="text-xs text-muted-foreground">Tradeoffs that meaningfully change what the AI builds.</p>
                    </div>
                    <div className="space-y-4 bg-card/50 border border-border/20 rounded-2xl p-4">
                      <SliderToggle label="Sights vs Pace" leftLabel="Fewer stops" rightLabel="More sights" value={form.priorities.sights} onChange={v => upP('sights', v)} />
                      <SliderToggle label="Budget vs Comfort" leftLabel="Save money" rightLabel="Spend freely" value={form.priorities.cost} onChange={v => upP('cost', v)} />
                      <SliderToggle label="Walking" leftLabel="Minimize it" rightLabel="Walk freely" value={form.priorities.walking} onChange={v => upP('walking', v)} />
                      <SliderToggle label="Vibe" leftLabel="Avoid tourists" rightLabel="Iconic highlights" value={form.priorities.tourist} onChange={v => upP('tourist', v)} />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Step 5 of 5</p>
                      <h2 className="text-xl font-black text-foreground leading-tight mb-1">Final intelligence</h2>
                      <p className="text-xs text-muted-foreground">Optional details that make the plan sharper. Skip any you don't need.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Ship tour price (€)</label>
                        <Input type="number" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" placeholder="e.g. 119" value={form.ship_excursion_price} onChange={e => up('ship_excursion_price', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">My DIY budget (€)</label>
                        <Input type="number" className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" placeholder="e.g. 40" value={form.diy_budget} onChange={e => up('diy_budget', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Must-see (optional)</label>
                      <Input className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" placeholder="e.g. Sagrada Familia, local market" value={form.must_see} onChange={e => up('must_see', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Avoid (optional)</label>
                      <Input className="h-11 bg-background/60 border-border/40 rounded-xl text-sm" placeholder="e.g. stairs, museums, long queues" value={form.avoid} onChange={e => up('avoid', e.target.value)} />
                    </div>

                    {/* Summary */}
                    <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Your plan profile</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                        <span>📍 {form.port_city}</span>
                        <span>⚓ All-aboard {form.all_aboard_time}</span>
                        <span>{GROUP_OPTIONS.find(g => g.value === form.group_type)?.emoji} {GROUP_OPTIONS.find(g => g.value === form.group_type)?.label}</span>
                        <span>{INTENT_OPTIONS.find(i => i.value === form.travel_mode)?.emoji} {INTENT_OPTIONS.find(i => i.value === form.travel_mode)?.label}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-6 py-4 border-t border-border/20 flex items-center justify-between bg-background/40">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2 font-black px-6"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!form.port_city.trim()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2 font-black px-8 shadow-xl shadow-accent/25"
              >
                <Sparkles className="w-4 h-4" /> Build my perfect day
              </Button>
            )}
          </div>
        </div>

        {/* Trust signal */}
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Cruise-aware · Return-safe · Built for limited port time
        </p>
      </motion.div>
    </div>
  );
}