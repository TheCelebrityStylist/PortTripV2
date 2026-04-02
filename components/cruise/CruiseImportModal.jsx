/**
 * CruiseImportModal — smart multi-mode cruise creation.
 * Modes: Upload | Paste | Manual | Single Port
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { format, addDays, parseISO } from 'date-fns';
import {
  Upload, ClipboardPaste, PenLine, Anchor, Ship, X, Check, Plus,
  Sparkles, Loader2, AlertTriangle, ChevronRight, MapPin, Calendar,
  Clock, FileText, Image, ArrowLeft, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── PORT ALIASES ──────────────────────────────────────────────────────────────
const PORT_LIST = [
  'Barcelona','Marseille','Genoa','Naples','Palermo','Civitavecchia (Rome)','Livorno (Florence)',
  'Venice','Split','Dubrovnik','Kotor','Piraeus (Athens)','Santorini','Mykonos','Rhodes',
  'Istanbul','Lisbon','Cádiz','Málaga','Valencia','Palma de Mallorca','Ibiza',
  'Southampton','Dublin','Cobh (Cork)','Amsterdam','Hamburg','Copenhagen','Oslo','Bergen',
  'Stavanger','Reykjavik','Dubai','Abu Dhabi','Singapore','Sydney','Miami','Fort Lauderdale',
  'Civitavecchia','Rome','Athens','Florence','Cork','Livorno',
];
const PORT_ALIASES = {
  'rome':'Civitavecchia (Rome)','civitavecchia':'Civitavecchia (Rome)',
  'athens':'Piraeus (Athens)','piraeus':'Piraeus (Athens)',
  'florence':'Livorno (Florence)','livorno':'Livorno (Florence)',
  'cork':'Cobh (Cork)','cobh':'Cobh (Cork)',
};
function resolvePort(raw) {
  const lower = raw?.toLowerCase().trim() || '';
  return PORT_ALIASES[lower] || PORT_LIST.find(p => p.toLowerCase() === lower) || raw;
}
function suggestPorts(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return PORT_LIST.filter(p => p.toLowerCase().includes(q)).slice(0, 6);
}

// ── CONFIDENCE BADGE ──────────────────────────────────────────────────────────
function ConfBadge({ conf }) {
  if (conf === 'high') return <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">✓ confident</span>;
  if (conf === 'medium') return <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">~ review</span>;
  return <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">? confirm</span>;
}

// ── MODE SELECT SCREEN ────────────────────────────────────────────────────────
const MODES = [
  { id: 'upload',   icon: Upload,         label: 'Upload itinerary',     desc: 'PDF, image, CSV, or text file',    accent: true },
  { id: 'paste',    icon: ClipboardPaste, label: 'Paste itinerary',      desc: 'Booking email, website text…'  },
  { id: 'manual',   icon: PenLine,        label: 'Build manually',       desc: 'Enter cruise + ports yourself' },
  { id: 'oneport',  icon: Anchor,         label: 'Plan one port',        desc: 'Quick single-port planner'      },
];

function ModeSelect({ onSelect }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground text-center mb-4">How do you want to add your cruise?</p>
      {MODES.map(m => (
        <button key={m.id} onClick={() => onSelect(m.id)}
          className={cn('w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all hover:border-accent/40 hover:bg-accent/5',
            m.accent ? 'border-accent/35 bg-accent/6' : 'border-border/30 bg-card/40')}>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            m.accent ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground')}>
            <m.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold', m.accent ? 'text-accent' : 'text-foreground')}>{m.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

// ── UPLOAD FLOW ───────────────────────────────────────────────────────────────
function UploadFlow({ onParsed, onBack }) {
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState('idle'); // idle|uploading|parsing|done
  const inputRef = useRef();

  const process = async (file) => {
    setState('uploading');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setState('parsing');
    const res = await base44.functions.invoke('parseItinerary', { fileUrl: file_url, fileType: file.name.split('.').pop() });
    if (res?.data?.result) {
      onParsed(res.data.result);
    } else {
      toast.error('Could not parse file — try pasting the text instead');
      setState('idle');
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    process(file);
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => state === 'idle' && inputRef.current?.click()}
        className={cn('rounded-2xl border-2 border-dashed px-8 py-14 text-center cursor-pointer transition-all',
          dragging ? 'border-accent bg-accent/8' : 'border-border/40 hover:border-accent/50 hover:bg-accent/4')}
      >
        <input ref={inputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
          onChange={e => handleFile(e.target.files[0])} />
        {state === 'idle' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-accent" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Drop your itinerary here</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Booking confirmation, itinerary PDF, screenshot, or CSV — we'll extract the ports automatically.
            </p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {['PDF','Image','CSV','TXT'].map(t => (
                <span key={t} className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
              ))}
            </div>
          </>
        )}
        {(state === 'uploading' || state === 'parsing') && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm font-bold text-foreground">{state === 'uploading' ? 'Uploading…' : 'Extracting itinerary…'}</p>
            <p className="text-xs text-muted-foreground">AI is reading your {state === 'uploading' ? 'file' : 'itinerary'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PASTE FLOW ────────────────────────────────────────────────────────────────
function PasteFlow({ onParsed, onBack }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke('parseItinerary', { text });
    if (res?.data?.result) {
      onParsed(res.data.result);
    } else {
      toast.error('Could not extract itinerary — please check your text');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div>
        <p className="text-xs font-bold text-foreground mb-1">Paste your itinerary</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Paste from your booking email, cruise line website, or type something like:<br />
          <span className="text-accent/80 italic">"MSC Virtuosa, Barcelona 14 Jun, Marseille 15 Jun, Naples 17 Jun, back 19 Jun"</span>
        </p>
        <textarea
          className="w-full h-40 rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent/50 resize-none transition-colors"
          placeholder="Paste cruise itinerary, booking confirmation, or describe your cruise…"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
      </div>
      <Button onClick={parse} disabled={!text.trim() || loading}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-11">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Extracting itinerary…' : 'Extract itinerary'}
      </Button>
    </div>
  );
}

// ── REVIEW SCREEN ─────────────────────────────────────────────────────────────
function ReviewScreen({ parsed, onConfirm, onBack }) {
  const [cruise, setCruise] = useState(parsed.cruise || {});
  const [ports, setPorts] = useState((parsed.ports || []).map((p, i) => ({ ...p, id: i, city: resolvePort(p.city) })));
  const [portSuggestions, setPortSuggestions] = useState({});
  const up = (k, v) => setCruise(c => ({ ...c, [k]: v }));
  const upPort = (id, k, v) => setPorts(ps => ps.map(p => p.id === id ? { ...p, [k]: v } : p));
  const removePort = (id) => setPorts(ps => ps.filter(p => p.id !== id));
  const addPort = () => setPorts(ps => [...ps, { id: Date.now(), city: '', date: null, all_aboard_time: '17:00', tender: false, confidence: 'high' }]);

  const handleCityChange = (id, val) => {
    upPort(id, 'city', val);
    setPortSuggestions(s => ({ ...s, [id]: suggestPorts(val) }));
  };

  const uncertain = parsed.uncertainFields || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80">
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <div>
          <p className="text-sm font-black text-foreground">Review your itinerary</p>
          <p className="text-[11px] text-muted-foreground">{parsed.parserNotes || 'Extracted from your input — confirm details below'}</p>
        </div>
      </div>

      {parsed.confidence === 'low' && (
        <div className="flex items-start gap-2 bg-yellow-400/8 border border-yellow-400/20 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400/90">Some fields had low confidence — please review the highlighted ones.</p>
        </div>
      )}

      {/* Cruise basics */}
      <div className="space-y-3 rounded-2xl border border-border/20 bg-card/40 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cruise Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              Cruise name {uncertain.includes('name') && <ConfBadge conf="low" />}
            </Label>
            <Input className="mt-1 h-9 text-sm bg-background/60 border-border/50 rounded-xl"
              value={cruise.name || ''} onChange={e => up('name', e.target.value)} placeholder="e.g. Mediterranean 2025" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Cruise line</Label>
            <Input className="mt-1 h-9 text-sm bg-background/60 border-border/50 rounded-xl"
              value={cruise.cruise_line || ''} onChange={e => up('cruise_line', e.target.value)} placeholder="MSC, Royal Caribbean…" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Ship name</Label>
            <Input className="mt-1 h-9 text-sm bg-background/60 border-border/50 rounded-xl"
              value={cruise.ship_name || ''} onChange={e => up('ship_name', e.target.value)} placeholder="MSC Virtuosa…" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              Departure {uncertain.includes('departure_date') && <ConfBadge conf="low" />}
            </Label>
            <Input type="date" className="mt-1 h-9 text-sm bg-background/60 border-border/50 rounded-xl"
              value={cruise.departure_date || ''} onChange={e => up('departure_date', e.target.value)} />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Return</Label>
            <Input type="date" className="mt-1 h-9 text-sm bg-background/60 border-border/50 rounded-xl"
              value={cruise.return_date || ''} onChange={e => up('return_date', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Ports */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          Port Stops <span className="font-normal text-muted-foreground/50 normal-case tracking-normal">{ports.length} detected</span>
        </p>
        <div className="space-y-2">
          {ports.map((p, i) => (
            <div key={p.id} className={cn('rounded-xl border px-3 py-2.5 space-y-2',
              p.confidence === 'low' ? 'border-yellow-400/25 bg-yellow-400/5' : 'border-border/25 bg-card/40')}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-black text-accent flex-shrink-0">{i+1}</div>
                <div className="flex-1 relative">
                  <Input className="h-8 text-sm bg-background/60 border-border/40 rounded-lg pr-16"
                    value={p.city} onChange={e => handleCityChange(p.id, e.target.value)} placeholder="Port city" />
                  {portSuggestions[p.id]?.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 rounded-lg border border-border/50 bg-card shadow-xl mt-0.5 overflow-hidden">
                      {portSuggestions[p.id].map(s => (
                        <button key={s} onClick={() => { upPort(p.id, 'city', s); setPortSuggestions(sg => ({ ...sg, [p.id]: [] })); }}
                          className="w-full text-left text-xs px-3 py-2 hover:bg-accent/10 text-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-accent/60" />{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <ConfBadge conf={p.confidence || 'high'} />
                <button onClick={() => removePort(p.id)} className="w-6 h-6 rounded-lg hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2 ml-7">
                <Input type="date" className="flex-1 h-7 text-xs bg-background/60 border-border/40 rounded-lg"
                  value={p.date || ''} onChange={e => upPort(p.id, 'date', e.target.value)} />
                <div className="relative flex items-center">
                  <Input type="time" className="w-28 h-7 text-xs bg-background/60 border-border/40 rounded-lg"
                    value={p.all_aboard_time || '17:00'} onChange={e => upPort(p.id, 'all_aboard_time', e.target.value)} />
                  {p.confidence === 'low' && p.all_aboard_time === '17:00' && (
                    <span className="text-[8px] text-muted-foreground/40 absolute -top-4 left-0">default</span>
                  )}
                </div>
                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer">
                  <input type="checkbox" checked={p.tender || false} onChange={e => upPort(p.id, 'tender', e.target.checked)} className="rounded" />
                  Tender
                </label>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPort} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/30 py-2.5 text-xs text-muted-foreground hover:border-accent/40 hover:text-accent transition-all">
          <Plus className="w-3.5 h-3.5" /> Add port stop
        </button>
      </div>

      <Button onClick={() => onConfirm({ cruise, ports })}
        disabled={!cruise.name?.trim() && !ports.length}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-11">
        <Check className="w-4 h-4" /> Save cruise + auto-generate plans
      </Button>
    </div>
  );
}

// ── MANUAL FLOW ───────────────────────────────────────────────────────────────
function ManualFlow({ onSave, onBack }) {
  const [step, setStep] = useState(1); // 1=basics 2=ports
  const [cruise, setCruise] = useState({ name: '', cruise_line: '', ship_name: '', home_port: '', departure_date: '', return_date: '' });
  const [ports, setPorts] = useState([]);
  const [draft, setDraft] = useState({ city: '', date: '', all_aboard_time: '17:00', tender: false });
  const [suggestions, setSuggestions] = useState([]);
  const up = (k, v) => setCruise(c => ({ ...c, [k]: v }));

  const addPort = () => {
    if (!draft.city.trim()) return;
    setPorts(ps => [...ps, { ...draft, id: Date.now(), city: resolvePort(draft.city) }]);
    // Smart default: next date
    const lastDate = draft.date ? format(addDays(parseISO(draft.date), 1), 'yyyy-MM-dd') : '';
    setDraft(d => ({ ...d, city: '', date: lastDate }));
    setSuggestions([]);
  };

  const removePort = (id) => setPorts(ps => ps.filter(p => p.id !== id));

  const handleCityInput = (v) => {
    setDraft(d => ({ ...d, city: v }));
    setSuggestions(suggestPorts(v));
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-foreground">Cruise details</p>
          <div>
            <Label className="text-xs text-muted-foreground">Cruise nickname *</Label>
            <Input autoFocus className="mt-1.5 h-10 bg-background/60 border-border/50 rounded-xl" placeholder="e.g. Med Summer 2025"
              value={cruise.name} onChange={e => up('name', e.target.value)} onKeyDown={e => e.key === 'Enter' && cruise.name.trim() && setStep(2)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Cruise line</Label>
              <Input className="mt-1.5 h-9 bg-background/60 border-border/50 rounded-xl" placeholder="MSC, Royal Caribbean…"
                value={cruise.cruise_line} onChange={e => up('cruise_line', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ship name</Label>
              <Input className="mt-1.5 h-9 bg-background/60 border-border/50 rounded-xl" placeholder="MSC Virtuosa…"
                value={cruise.ship_name} onChange={e => up('ship_name', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Departure</Label>
              <Input type="date" className="mt-1.5 h-9 bg-background/60 border-border/50 rounded-xl"
                value={cruise.departure_date} onChange={e => { up('departure_date', e.target.value); setDraft(d => ({ ...d, date: e.target.value })); }} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Return</Label>
              <Input type="date" className="mt-1.5 h-9 bg-background/60 border-border/50 rounded-xl"
                value={cruise.return_date} onChange={e => up('return_date', e.target.value)} />
            </div>
          </div>
          <Button onClick={() => setStep(2)} disabled={!cruise.name.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-11">
            Next — Add ports <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">Port stops for <span className="text-accent">{cruise.name}</span></p>

          {/* Ports list */}
          <div className="space-y-2">
            {ports.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border/25 bg-card/40 px-3 py-2">
                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-black text-accent">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{p.city}</p>
                  <p className="text-[10px] text-muted-foreground">{p.date || 'No date'} · {p.all_aboard_time}{p.tender ? ' · Tender' : ''}</p>
                </div>
                <button onClick={() => removePort(p.id)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add port row */}
          <div className="rounded-xl border border-dashed border-border/40 p-3 space-y-2 bg-card/20">
            <div className="relative">
              <Input autoFocus className="h-9 text-sm bg-background/60 border-border/50 rounded-lg" placeholder="Port city (type to search)"
                value={draft.city} onChange={e => handleCityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPort()} />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 rounded-lg border border-border/50 bg-card shadow-xl mt-0.5 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => { setDraft(d => ({ ...d, city: s })); setSuggestions([]); }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-accent/10 text-foreground flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-accent/60" />{s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="date" className="h-8 text-xs bg-background/60 border-border/50 rounded-lg col-span-1"
                value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} />
              <div className="col-span-1">
                <Input type="time" className="h-8 text-xs bg-background/60 border-border/50 rounded-lg"
                  value={draft.all_aboard_time} onChange={e => setDraft(d => ({ ...d, all_aboard_time: e.target.value }))} />
              </div>
              <Button onClick={addPort} disabled={!draft.city.trim()} className="h-8 bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 rounded-lg text-xs font-bold">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={draft.tender} onChange={e => setDraft(d => ({ ...d, tender: e.target.checked }))} className="rounded" />
              Tender port
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex-shrink-0 text-muted-foreground">Back</Button>
            <Button onClick={() => onSave({ cruise, ports })} disabled={!cruise.name.trim()}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-10 text-sm">
              <Check className="w-4 h-4" /> Save cruise
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SINGLE PORT FLOW ──────────────────────────────────────────────────────────
function SinglePortFlow({ onSave, onBack }) {
  const [city, setCity] = useState('');
  const [allAboard, setAllAboard] = useState('17:00');
  const [buffer, setBuffer] = useState(90);
  const [tender, setTender] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div>
        <p className="text-sm font-black text-foreground mb-0.5">Plan one port day</p>
        <p className="text-xs text-muted-foreground">Skip cruise creation — jump straight to planning.</p>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <Label className="text-xs text-muted-foreground">Port city</Label>
          <Input autoFocus className="mt-1.5 h-11 text-base bg-background/60 border-border/50 rounded-xl"
            placeholder="Barcelona, Santorini, Dublin…"
            value={city} onChange={e => { setCity(e.target.value); setSuggestions(suggestPorts(e.target.value)); }} />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 rounded-xl border border-border/50 bg-card shadow-xl mt-0.5 overflow-hidden">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setCity(s); setSuggestions([]); }}
                  className="w-full text-left text-sm px-4 py-2.5 hover:bg-accent/10 text-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-accent/60" />{s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">All-aboard time</Label>
            <Input type="time" className="mt-1.5 h-10 bg-background/60 border-border/50 rounded-xl"
              value={allAboard} onChange={e => setAllAboard(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Buffer (minutes)</Label>
            <Input type="number" className="mt-1.5 h-10 bg-background/60 border-border/50 rounded-xl"
              value={buffer} onChange={e => setBuffer(parseInt(e.target.value))} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={tender} onChange={e => setTender(e.target.checked)} className="rounded" />
          Tender port (+30min buffer)
        </label>
      </div>
      <Button onClick={() => onSave({ city: resolvePort(city), allAboard, buffer, tender })}
        disabled={!city.trim()}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl h-12 text-sm">
        <Zap className="w-4 h-4" /> Generate my port day now
      </Button>
    </div>
  );
}

// ── MAIN MODAL ────────────────────────────────────────────────────────────────
export default function CruiseImportModal({ open, onOpenChange, onSaveCruise, onSinglePort }) {
  const [mode, setMode] = useState(null);
  const [parsed, setParsed] = useState(null);

  const reset = () => { setMode(null); setParsed(null); };
  const close = () => { reset(); onOpenChange(false); };

  const handleParsed = (result) => {
    if (!result?.cruise && !result?.ports?.length) {
      toast.error('Could not extract itinerary data — try pasting the text');
      return;
    }
    // Auto-fill cruise name from ship/line if missing
    if (!result.cruise?.name && (result.cruise?.cruise_line || result.cruise?.ship_name)) {
      result.cruise.name = [result.cruise.cruise_line, result.cruise.ship_name].filter(Boolean).join(' ');
    }
    setParsed(result);
  };

  const handleConfirmParsed = ({ cruise, ports }) => {
    onSaveCruise({ ...cruise, ports: ports.map(p => ({ city: p.city, date: p.date, all_aboard_time: p.all_aboard_time || '17:00', tender: p.tender || false })) });
    close();
  };

  const handleManualSave = ({ cruise, ports }) => {
    onSaveCruise({ ...cruise, ports: ports.map(p => ({ city: p.city, date: p.date, all_aboard_time: p.all_aboard_time || '17:00', tender: p.tender || false })) });
    close();
  };

  const handleSinglePort = (data) => {
    onSinglePort(data);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto border-border/60 bg-card/97 backdrop-blur-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Ship className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-foreground">Add your cruise</p>
            <p className="text-xs text-muted-foreground">Upload, paste, or build — AI does the heavy lifting</p>
          </div>
          <button onClick={close} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!mode && !parsed && (
            <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModeSelect onSelect={setMode} />
            </motion.div>
          )}

          {mode === 'upload' && !parsed && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UploadFlow onParsed={handleParsed} onBack={reset} />
            </motion.div>
          )}

          {mode === 'paste' && !parsed && (
            <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PasteFlow onParsed={handleParsed} onBack={reset} />
            </motion.div>
          )}

          {(mode === 'upload' || mode === 'paste') && parsed && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReviewScreen parsed={parsed} onConfirm={handleConfirmParsed} onBack={() => setParsed(null)} />
            </motion.div>
          )}

          {mode === 'manual' && (
            <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ManualFlow onSave={handleManualSave} onBack={reset} />
            </motion.div>
          )}

          {mode === 'oneport' && (
            <motion.div key="oneport" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SinglePortFlow onSave={handleSinglePort} onBack={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}