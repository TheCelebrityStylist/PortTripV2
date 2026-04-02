/**
 * JourneyTimeline — storyboard-style route renderer.
 * Renders journey[] from plannerEngine with transport steps, phase markers, wow moments.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Bus, Train, Car, Ship, Zap, Clock, DollarSign,
  Star, ChevronDown, AlertTriangle, ExternalLink, Sparkles,
  Footprints, Trash2, Info, Coffee, Heart, Shield, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── TRANSPORT CONFIG ──────────────────────────────────────────────────────────
const MODE = {
  walk:      { icon: Footprints, color: 'text-foreground/50',  bg: 'bg-foreground/5',   border: 'border-foreground/10', label: 'Walk' },
  bus:       { icon: Bus,        color: 'text-blue-400',       bg: 'bg-blue-400/8',     border: 'border-blue-400/15',  label: 'Bus' },
  metro:     { icon: Zap,        color: 'text-purple-400',     bg: 'bg-purple-400/8',   border: 'border-purple-400/15',label: 'Metro' },
  train:     { icon: Train,      color: 'text-green-400',      bg: 'bg-green-400/8',    border: 'border-green-400/15', label: 'Train' },
  taxi:      { icon: Car,        color: 'text-yellow-400',     bg: 'bg-yellow-400/8',   border: 'border-yellow-400/15',label: 'Taxi' },
  tram:      { icon: Zap,        color: 'text-cyan-400',       bg: 'bg-cyan-400/8',     border: 'border-cyan-400/15',  label: 'Tram' },
  ferry:     { icon: Ship,       color: 'text-accent',         bg: 'bg-accent/8',       border: 'border-accent/15',    label: 'Ferry' },
  cable_car: { icon: Navigation, color: 'text-orange-400',     bg: 'bg-orange-400/8',   border: 'border-orange-400/15',label: 'Cable Car' },
};

// ── STOP TYPE CONFIG ──────────────────────────────────────────────────────────
const STOP_TYPE = {
  arrival:    { emoji: '⚓', accent: true,   label: 'Port' },
  departure:  { emoji: '🚢', accent: true,   label: 'Return' },
  stop:       { emoji: '📍', accent: false,  label: 'Stop' },
  food:       { emoji: '🍽️', accent: false, label: 'Lunch', color: 'text-orange-400', border: 'border-orange-400/20' },
  viewpoint:  { emoji: '🌅', accent: false,  label: 'Viewpoint', color: 'text-blue-400', border: 'border-blue-400/20' },
  culture:    { emoji: '🏛️', accent: false, label: 'Culture' },
  nature:     { emoji: '🌿', accent: false,  label: 'Nature', color: 'text-green-400', border: 'border-green-400/20' },
  hidden_gem: { emoji: '💎', accent: false,  label: 'Hidden Gem', color: 'text-purple-400', border: 'border-purple-400/20' },
};

const SCORE_STYLE = s => s >= 85 ? 'text-green-400 bg-green-400/10 border-green-400/25'
  : s >= 70 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25'
  : 'text-muted-foreground bg-secondary border-border/20';

// Phase detection from journey time
function detectPhase(time) {
  if (!time) return null;
  const [h] = time.split(':').map(Number);
  if (h < 10) return { label: 'Morning', icon: Coffee, color: 'text-blue-400' };
  if (h < 13) return { label: 'Midday', icon: Star, color: 'text-yellow-400' };
  if (h < 16) return { label: 'Afternoon', icon: Eye, color: 'text-orange-400' };
  return { label: 'Return Window', icon: Shield, color: 'text-accent' };
}

// ── TRANSPORT STEP ────────────────────────────────────────────────────────────
function TransportStep({ step }) {
  const [open, setOpen] = useState(false);
  const cfg = MODE[step.mode] || MODE.walk;
  const Icon = cfg.icon;
  const hasDetail = step.instruction || step.whyThisMode || step.alternativeMode;

  return (
    <div className="flex items-start gap-0 py-0.5 group">
      {/* Time */}
      <div className="w-14 flex-shrink-0 pt-2.5 text-right pr-2">
        <span className="text-[9px] tabular-nums text-muted-foreground/30 font-mono">{step.startTime || ''}</span>
      </div>
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-6 pt-2.5">
        <div className={cn('w-2 h-2 rounded-full border', cfg.border, cfg.bg)} />
        <div className="w-px flex-1 bg-border/12 min-h-[20px]" />
      </div>
      {/* Content */}
      <div className="flex-1 ml-2 mb-0.5">
        <button onClick={() => hasDetail && setOpen(o => !o)}
          className={cn('w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all',
            cfg.border, cfg.bg, hasDetail && 'hover:opacity-80 cursor-pointer', !hasDetail && 'cursor-default')}>
          <Icon className={cn('w-3 h-3 flex-shrink-0', cfg.color)} />
          <span className={cn('text-[11px] font-semibold flex-1 truncate', cfg.color)}>{step.title}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0 text-[9px] text-muted-foreground/40">
            {step.durationMin > 0 && <span>{step.durationMin}m</span>}
            {step.estimatedCostEur > 0 && <span>€{step.estimatedCostEur}</span>}
            {step.estimatedCostEur === 0 && step.mode !== 'walk' && <span className="text-green-400">free</span>}
            {hasDetail && <ChevronDown className={cn('w-2.5 h-2.5 transition-transform', open && 'rotate-180')} />}
          </div>
        </button>
        <AnimatePresence>
          {open && hasDetail && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }} className="overflow-hidden">
              <div className={cn('mx-1 mt-0.5 rounded-lg border px-3 py-2 space-y-1.5', cfg.border, cfg.bg)}>
                {step.instruction && <p className="text-[10px] text-foreground/80 leading-snug">{step.instruction}</p>}
                {step.whyThisMode && (
                  <p className="text-[10px] text-muted-foreground/60 flex items-start gap-1">
                    <Info className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />{step.whyThisMode}
                  </p>
                )}
                {step.alternativeMode && (
                  <p className="text-[9px] text-muted-foreground/40 border-t border-border/10 pt-1">Alt: {step.alternativeMode}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── STOP CARD ─────────────────────────────────────────────────────────────────
function StopCard({ step, index, isWow, onDelete, onAiRefine, blockId, phaseBreak }) {
  const [open, setOpen] = useState(false);
  const cfg = STOP_TYPE[step.type] || STOP_TYPE.stop;
  const score = step.worthItScore || step.stopScore;
  const isTerminal = step.type === 'arrival' || step.type === 'departure';
  const trapHigh = step.touristTrapRisk === 'high';
  const mapsUrl = step.title ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(step.title + ' ' + (step.area || ''))}` : null;

  return (
    <>
      {/* Phase break label */}
      {phaseBreak && (
        <div className="flex items-center gap-2 ml-20 mb-2 mt-1">
          <phaseBreak.icon className={cn('w-2.5 h-2.5', phaseBreak.color)} />
          <span className={cn('text-[9px] font-black uppercase tracking-widest', phaseBreak.color)}>{phaseBreak.label}</span>
          <div className="flex-1 h-px bg-border/10" />
        </div>
      )}

      <div className="flex items-start gap-0 py-0.5">
        {/* Time */}
        <div className="w-14 flex-shrink-0 pt-4 text-right pr-2">
          <span className={cn('text-[10px] font-bold tabular-nums font-mono',
            isTerminal ? 'text-accent' : 'text-muted-foreground/50')}>
            {step.startTime || ''}
          </span>
        </div>

        {/* Spine dot */}
        <div className="flex flex-col items-center flex-shrink-0 w-6 pt-4">
          <div className={cn('rounded-full border-2 border-background flex-shrink-0 z-10',
            isTerminal ? 'w-4 h-4 bg-accent shadow-lg shadow-accent/30'
              : isWow ? 'w-3.5 h-3.5 bg-yellow-400 shadow-md shadow-yellow-400/30'
              : trapHigh ? 'w-3 h-3 bg-red-400/60'
              : 'w-2.5 h-2.5 bg-foreground/30')} />
          <div className="w-px flex-1 bg-border/12 min-h-[40px]" />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className={cn('flex-1 ml-2 mb-2 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md',
            isTerminal ? 'border-accent/30 bg-gradient-to-r from-accent/8 to-transparent'
              : isWow ? 'border-yellow-400/25 bg-gradient-to-br from-yellow-400/6 to-orange-400/4'
              : cfg.border ? cfg.border + ' bg-card/60 hover:border-opacity-40'
              : 'border-border/25 bg-card/60 hover:border-accent/25'
          )}
          onClick={() => setOpen(o => !o)}
        >
          {/* Wow badge */}
          {isWow && (
            <div className="flex items-center gap-1 px-4 pt-2.5 pb-0">
              <Star className="w-2.5 h-2.5 text-yellow-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Wow Moment</span>
            </div>
          )}

          {/* Main row */}
          <div className="flex items-start gap-3 px-4 py-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base',
              isTerminal ? 'bg-accent/12' : 'bg-secondary/50')}>
              {cfg.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className={cn('text-sm font-bold leading-tight', isTerminal ? 'text-accent' : cfg.color || 'text-foreground')}>
                  {step.title}
                </h3>
                {score > 0 && (
                  <span className={cn('text-[8px] font-black px-1.5 py-0.5 rounded-full border flex-shrink-0', SCORE_STYLE(score))}>
                    {score}
                  </span>
                )}
              </div>
              {step.area && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2 h-2" />{step.area}
                </p>
              )}
              {trapHigh && <p className="text-[9px] text-red-400 font-bold mt-0.5">⚠ Tourist trap risk</p>}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {step.estimatedCostEur > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <DollarSign className="w-2.5 h-2.5" />€{step.estimatedCostEur}
                </span>
              )}
              {step.estimatedCostEur === 0 && !isTerminal && (
                <span className="text-[8px] text-green-400 font-bold">Free</span>
              )}
              {step.durationMin > 0 && !isTerminal && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {step.durationMin >= 60 ? `${Math.floor(step.durationMin/60)}h${step.durationMin % 60 ? `${step.durationMin % 60}m` : ''}` : `${step.durationMin}m`}
                </span>
              )}
              <ChevronDown className={cn('w-3 h-3 text-muted-foreground/25 transition-transform mt-0.5', open && 'rotate-180')} />
            </div>
          </div>

          {/* Expanded */}
          <AnimatePresence>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="px-4 pb-4 pt-0 border-t border-border/10 space-y-2.5 mt-1">
                  {step.why && <p className="text-[11px] text-muted-foreground leading-relaxed">{step.why}</p>}
                  {step.insiderTip && (
                    <div className="flex items-start gap-2 bg-accent/6 border border-accent/12 rounded-xl px-3 py-2">
                      <Star className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-snug">
                        <span className="font-bold text-accent">Tip: </span>
                        <span className="text-foreground/80">{step.insiderTip}</span>
                      </p>
                    </div>
                  )}
                  {step.alternatives?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Alternatives</p>
                      {step.alternatives.map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="text-accent/60">→</span>
                          <span><span className="font-semibold text-foreground/70">{a.title}</span> — {a.reasonToSwap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 rounded-lg px-2.5 py-1.5 font-semibold hover:bg-blue-400/18 transition-all">
                        <ExternalLink className="w-2.5 h-2.5" />Maps
                      </a>
                    )}
                    {onAiRefine && (
                      <button onClick={e => { e.stopPropagation(); onAiRefine(step); }}
                        className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 rounded-lg px-2.5 py-1.5 font-semibold hover:bg-accent/18 transition-all">
                        <Sparkles className="w-2.5 h-2.5" />Refine
                      </button>
                    )}
                    {onDelete && blockId && (
                      <button onClick={e => { e.stopPropagation(); onDelete(blockId); }}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary rounded-lg px-2.5 py-1.5 hover:bg-destructive/10 hover:text-destructive transition-all">
                        <Trash2 className="w-2.5 h-2.5" />Remove
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function JourneyTimeline({ journey, blocks, plan, onDelete, onAiRefine, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-6 px-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 ml-14">
            <div className="w-2 h-2 rounded-full bg-border/30 flex-shrink-0" />
            <div className={cn('flex-1 rounded-xl bg-card/30 animate-pulse', i % 3 === 1 ? 'h-7' : 'h-16')} />
          </div>
        ))}
      </div>
    );
  }

  const renderJourney = (items) => {
    if (!items?.length) return null;
    let lastPhase = null;
    const totalCost = items.reduce((s, j) => s + (j.estimatedCostEur || 0), 0);
    const stopCount = items.filter(j => j.type === 'stop' || j.type === 'food').length;
    const transportCost = items.filter(j => j.type === 'transport').reduce((s, j) => s + (j.estimatedCostEur || 0), 0);
    const wowTitle = plan?.wowMoment?.title || null;

    return (
      <div className="py-3">
        <div className="relative">
          {/* Spine line */}
          <div className="absolute left-[79px] top-4 bottom-4 w-px bg-gradient-to-b from-accent/20 via-border/15 to-transparent pointer-events-none" />

          {items.map((step, i) => {
            const phase = step.startTime ? detectPhase(step.startTime) : null;
            const showPhase = phase && phase.label !== lastPhase;
            if (showPhase) lastPhase = phase?.label;

            const matchBlock = blocks?.find(b => b.title?.toLowerCase().trim() === step.title?.toLowerCase().trim());

            if (step.type === 'transport') {
              return <TransportStep key={step.id || i} step={step} />;
            }
            return (
              <StopCard
                key={step.id || i}
                step={step}
                index={i}
                isWow={wowTitle && step.title?.toLowerCase().includes(wowTitle.toLowerCase().slice(0, 15))}
                onDelete={onDelete}
                onAiRefine={onAiRefine ? () => onAiRefine(step) : null}
                blockId={matchBlock?.id}
                phaseBreak={showPhase ? phase : null}
              />
            );
          })}
        </div>

        {/* Footer summary */}
        <div className="mt-3 pt-3 border-t border-border/10 flex flex-wrap gap-4 text-xs text-muted-foreground ml-20 pl-2">
          <span className="font-bold text-foreground">{stopCount} stops</span>
          {totalCost > 0 && <span>€{totalCost} est. total</span>}
          {transportCost > 0 && <span className="text-blue-400/70">€{transportCost} transport</span>}
          {plan?.ship_excursion_price > 0 && totalCost > 0 && plan.ship_excursion_price > totalCost && (
            <span className="text-green-400 font-bold">Save ~€{Math.round(plan.ship_excursion_price - totalCost)} vs ship</span>
          )}
        </div>
      </div>
    );
  };

  // Render AI journey
  if (journey?.length > 0) return renderJourney(journey);

  // Render from blocks (legacy)
  if (blocks?.length > 0) {
    const items = blocks.map(b => {
      let meta = {};
      try { meta = b.color_tag ? JSON.parse(b.color_tag) : {}; } catch (_) {}
      return {
        id: b.id,
        type: meta.journeyType || (b.block_type === 'transit' ? 'transport' : b.block_type || 'stop'),
        mode: b.transport_mode || 'walk',
        title: b.title,
        subtitle: b.subtitle || '',
        area: b.location || '',
        startTime: b.start_time ? new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        durationMin: b.duration_minutes || 0,
        estimatedCostEur: b.cost_estimate || 0,
        insiderTip: b.insider_tip || '',
        why: b.notes || '',
        instruction: meta.instruction || b.notes || '',
        whyThisMode: meta.whyThisMode || '',
        alternativeMode: meta.alternativeMode || '',
        alternatives: meta.alternatives || [],
        stopScore: meta.stopScore,
        worthItScore: meta.worthItScore,
        touristTrapRisk: meta.touristTrapRisk,
      };
    });
    return renderJourney(items);
  }

  // Empty state
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-accent" />
      </motion.div>
      <div>
        <p className="text-base font-bold text-foreground mb-1">Your journey begins here</p>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Use the AI planner to build a complete day — with every stop, transport step, and route explained.
        </p>
      </div>
    </div>
  );
}