import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Plus, Check, Clock, MapPin, DollarSign, Send, ChevronRight, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = [
  '🏛 Focus on history & architecture',
  '🍽 Best local food & markets',
  '🌿 Nature & outdoor adventure',
  '🧘 Relaxed, low-effort day',
  '💰 Keep total cost under €40',
  '👨‍👩‍👧 Family-friendly with kids',
];

const BLOCK_TYPE_COLORS = {
  stop: 'bg-accent/15 text-accent border-accent/30',
  transit: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
  buffer: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30',
  arrival: 'bg-green-400/15 text-green-400 border-green-400/30',
  departure: 'bg-red-400/15 text-red-400 border-red-400/30',
};

export default function AiPortDayDialog({ open, onOpenChange, plan, existingBlocks, onAccept }) {
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState('idle'); // idle | thinking | result
  const [suggestions, setSuggestions] = useState(null);
  const [accepted, setAccepted] = useState(new Set());
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (open && stage === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setStage('idle');
      setSuggestions(null);
      setAccepted(new Set());
      setPrompt('');
    }
  }, [open]);

  const handleGenerate = async (customPrompt) => {
    const usePrompt = customPrompt ?? prompt;
    if (!plan?.port_city && !usePrompt.trim()) return;

    setStage('thinking');
    setSuggestions(null);

    const existingSummary = (existingBlocks || []).map(b =>
      `${b.block_type}: ${b.title}${b.start_time ? ` at ${b.start_time}` : ''}`
    ).join('\n');

    const portContext = plan ? `
Port: ${plan.port_city}
All aboard: ${plan.all_aboard_time}
Buffer: ${plan.buffer_minutes || 90} minutes
Tender delay: ${plan.tender_delay_minutes || 0} minutes
Travel style: ${plan.travel_mode || 'first_time'}
Group type: ${plan.group_type || 'couple'}
Budget mode: ${plan.budget_mode || 'mid_range'}
DIY budget: €${plan.diy_budget || 50}
` : '';

    const result = await base44.functions.invoke('cruiseAI', {
      portContext,
      existingSummary,
      userPrompt: usePrompt || 'Build me an optimized port day itinerary',
    });

    const newSuggestions = result?.data?.suggestions || [];
    setSuggestions(newSuggestions);
    setStage('result');
  };

  const handleAccept = (s, idx) => {
    onAccept(s);
    setAccepted(prev => new Set([...prev, idx]));
    toast.success(`"${s.title}" added to your timeline`);
  };

  const handleAcceptAll = () => {
    suggestions.forEach((s, idx) => {
      if (!accepted.has(idx)) {
        onAccept(s);
      }
    });
    toast.success(`✅ ${suggestions.length} stops added to timeline`);
    onOpenChange(false);
  };

  const totalCost = suggestions?.reduce((s, r) => s + (r.cost_estimate || 0), 0) || 0;
  const totalMins = suggestions?.reduce((s, r) => s + (r.duration_minutes || 0), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">AI Port Day Planner</DialogTitle>
              {plan?.port_city && (
                <p className="text-xs text-muted-foreground">
                  {plan.port_city} · All aboard {plan.all_aboard_time} · {plan.travel_mode?.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* IDLE stage */}
            {stage === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-5"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Quick start — pick a vibe:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map(qp => (
                      <button
                        key={qp}
                        onClick={() => {
                          setPrompt(qp.replace(/^[^\w]+/, ''));
                          handleGenerate(qp.replace(/^[^\w]+/, ''));
                        }}
                        className="text-left text-xs px-3 py-2.5 rounded-xl border border-border/50 bg-card/60 text-muted-foreground hover:border-accent/40 hover:text-foreground hover:bg-accent/5 transition-all"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">or describe your ideal day</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    className="flex-1 h-11 rounded-xl border border-border/50 bg-card/60 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
                    placeholder={`What kind of day in ${plan?.port_city || 'this port'}?`}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  />
                  <Button
                    onClick={() => handleGenerate()}
                    disabled={!prompt.trim() && !plan?.port_city}
                    className="h-11 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-5 font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* THINKING stage */}
            {stage === 'thinking' && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 flex flex-col items-center justify-center gap-5 text-center min-h-[280px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-accent/10 animate-ping" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground mb-1">Building your {plan?.port_city} itinerary…</p>
                  <p className="text-sm text-muted-foreground">Checking safety windows, optimising routes, estimating costs</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 0.15, 0.3].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* RESULT stage */}
            {stage === 'result' && suggestions && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-4"
              >
                {/* Summary bar */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/8 border border-accent/20">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                      <span className="text-accent font-bold">{suggestions.length} stops</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      ~{Math.round(totalMins / 60)}h {totalMins % 60}m
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      est. €{totalCost}
                    </span>
                  </div>
                  <button
                    onClick={() => { setStage('idle'); setPrompt(''); }}
                    className="text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    Regenerate
                  </button>
                </div>

                {/* Stop cards */}
                <div className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={cn(
                        "rounded-xl border p-4 transition-all",
                        accepted.has(idx)
                          ? "border-green-400/30 bg-green-400/5"
                          : "border-border/40 bg-card/60 hover:border-accent/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-black text-muted-foreground mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-bold text-foreground">{s.title}</h4>
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide",
                                BLOCK_TYPE_COLORS[s.block_type] || BLOCK_TYPE_COLORS.stop
                              )}>
                                {s.block_type}
                              </span>
                            </div>
                            {s.subtitle && <p className="text-xs text-muted-foreground mb-1.5">{s.subtitle}</p>}
                            <div className="flex flex-wrap gap-3">
                              {s.duration_minutes > 0 && (
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{s.duration_minutes}m
                                </span>
                              )}
                              {s.location && (
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1 truncate max-w-36">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />{s.location}
                                </span>
                              )}
                              {s.cost_estimate > 0 && (
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />€{s.cost_estimate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(s, idx)}
                          disabled={accepted.has(idx)}
                          variant={accepted.has(idx) ? "ghost" : "outline"}
                          className={cn(
                            "h-8 text-xs gap-1.5 flex-shrink-0 rounded-lg",
                            accepted.has(idx) && "text-green-400 border-green-400/30"
                          )}
                        >
                          {accepted.has(idx) ? <><Check className="w-3 h-3" />Added</> : <><Plus className="w-3 h-3" />Add</>}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {stage === 'result' && suggestions && (
          <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{accepted.size} of {suggestions.length} added</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Done</Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add all {suggestions.length} stops
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}