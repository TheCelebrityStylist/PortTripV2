import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import PortCommunityWidget from '../components/PortCommunityWidget';
import { cachePortGuide, getCachedPortGuide, isOffline } from '../utils/offlineCache';
import { cleanHtml } from '../utils/cleanContent';
import {
  ArrowLeft, MapPin, Utensils, Star, Shield, Bus, Clock, Anchor, Sparkles,
  ChevronDown, ChevronUp, Zap, AlertTriangle, CheckCircle, Info,
  Car, Navigation, Ship, ChevronRight, Wallet,
  Globe, Phone, Crown, TrendingDown, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FLAG_MAP = {
  no: '🇳🇴', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷', gr: '🇬🇷', hr: '🇭🇷',
  pt: '🇵🇹', mt: '🇲🇹', me: '🇲🇪', tr: '🇹🇷', de: '🇩🇪', gb: '🇬🇧',
  nl: '🇳🇱', be: '🇧🇪', dk: '🇩🇰', se: '🇸🇪', fi: '🇫🇮', is: '🇮🇸',
  bs: '🇧🇸', mx: '🇲🇽', us: '🇺🇸', bb: '🇧🇧', jm: '🇯🇲',
};

function MarkdownContent({ content, collapsed = true }) {
  const [expanded, setExpanded] = useState(!collapsed);
  if (!content || content.length < 20) return null;
  const isLong = content.length > 800;
  return (
    <div>
      <div className={cn(
        'prose prose-invert max-w-none',
        'prose-h1:font-black prose-h1:text-foreground prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-3',
        'prose-h2:font-black prose-h2:text-foreground prose-h2:text-lg prose-h2:mt-7 prose-h2:mb-2.5 prose-h2:border-b prose-h2:border-border/20 prose-h2:pb-2',
        'prose-h3:font-bold prose-h3:text-accent prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2',
        'prose-p:text-foreground/80 prose-p:leading-[1.9] prose-p:text-[15px] prose-p:mb-4',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-em:text-muted-foreground prose-em:not-italic',
        'prose-ul:my-4 prose-ol:my-4',
        'prose-li:text-foreground/80 prose-li:text-[14px] prose-li:leading-[1.8] prose-li:my-1.5',
        'prose-ul:pl-5 prose-ol:pl-5',
        'prose-a:text-accent prose-a:no-underline prose-a:font-medium hover:prose-a:underline',
        'prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-muted-foreground prose-blockquote:bg-accent/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1',
        'prose-hr:border-border/20 prose-hr:my-6',
        !expanded && isLong && 'line-clamp-[10]'
      )}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-accent mt-4 hover:underline font-semibold">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5" />Read more</>}
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">{children}</p>;
}

function SectionTitle({ children }) {
  return <h2 className="font-display text-2xl md:text-3xl font-black text-foreground leading-tight mb-5">{children}</h2>;
}

function InfoCard({ icon: Icon, label, value, accent }) {
  if (!value) return null;
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-accent/25 bg-accent/5" : "border-border/30 bg-card/40")}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-3.5 h-3.5", accent ? "text-accent" : "text-muted-foreground")} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-sm font-bold", accent ? "text-accent" : "text-foreground")}>{value}</p>
    </div>
  );
}

function ItineraryTabs({ port }) {
  const [active, setActive] = useState('first_time');
  const tabs = [
    { key: 'first_time', emoji: '🗺️', label: 'First Timer', content: port.itinerary_first_time },
    { key: 'nature', emoji: '🌿', label: 'Nature', content: port.itinerary_nature },
    { key: 'history', emoji: '🏛️', label: 'History', content: port.itinerary_history },
    { key: 'relaxation', emoji: '☀️', label: 'Relax', content: port.itinerary_relaxation },
    { key: 'culture', emoji: '🎭', label: 'Culture', content: port.itinerary_culture },
  ].filter(t => t.content);

  if (tabs.length === 0) return null;
  const current = tabs.find(t => t.key === active) || tabs[0];

  return (
    <div>
      <SectionLabel>Sample Day Plans</SectionLabel>
      <SectionTitle>How to spend your day in {port.city}</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)}
            className={cn("text-sm px-4 py-2 rounded-full border font-semibold transition-all",
              active === t.key ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20" : "border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground"
            )}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border/30 bg-card/50 p-6">
        <MarkdownContent content={current?.content} collapsed={false} />
      </div>
      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 text-accent mt-0.5" />
        <span>Editorial sample plans. For a time-stamped itinerary built around your ship schedule, <Link to={`/planner?port=${encodeURIComponent(port.city)}`} className="text-accent hover:underline font-semibold">use the AI Planner</Link>.</span>
      </div>
    </div>
  );
}

function ExcursionCard({ title, description, shipPrice, diyPrice, index }) {
  if (!title) return null;
  const saving = shipPrice && diyPrice ? shipPrice - diyPrice : null;
  return (
    <div className="rounded-2xl border border-border/30 bg-card/50 p-6 hover:border-accent/20 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-black text-muted-foreground">
          {['★', '★★', '★★★'][index] || '★'}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-black text-foreground mb-2">{title}</h4>
          {description && (
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-muted-foreground prose-p:text-sm">
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
          )}
          {saving !== null && saving > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Ship className="w-3 h-3" /> Ship tour: €{shipPrice}
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                <TrendingDown className="w-3 h-3" /> DIY: €{diyPrice} (save €{saving})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FAQAccordion({ port }) {
  const faqs = [
    { q: `How do I get from ${port.city} cruise port to the city centre?`, a: port.transport_port_to_city },
    { q: `What are the must-see attractions in ${port.city} for cruise passengers?`, a: port.attraction_highlights },
    { q: `What local food should I try in ${port.city}?`, a: port.local_food },
    { q: `Is ${port.city} safe for tourists?`, a: port.safety_security },
    { q: `What unique experiences can I have in ${port.city} beyond the usual tourist trail?`, a: port.unique_experiences },
  ].filter(f => f.a);

  const [open, setOpen] = useState(null);
  if (faqs.length === 0) return null;

  return (
    <div>
      <SectionLabel>FAQ</SectionLabel>
      <SectionTitle>{port.city} Cruise Port — Common Questions</SectionTitle>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border/30 overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card/80 transition-colors" onClick={() => setOpen(open === i ? null : i)}>
              <h3 className="text-sm font-bold text-foreground pr-4">{faq.q}</h3>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 bg-card/30">
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-muted-foreground prose-p:text-[14px] prose-strong:text-foreground">
                  <ReactMarkdown>{faq.a}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CostCalculator({ port }) {
  const [people, setPeople] = useState(2);
  const shipCost = (port.avg_ship_excursion_price || 119) * people;
  const diyCost = (port.avg_diy_cost || 35) * people;
  const saving = shipCost - diyCost;

  return (
    <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/8 to-transparent p-6">
      <SectionLabel>Cost Calculator</SectionLabel>
      <p className="font-display text-xl font-black text-foreground mb-4">Ship tour vs DIY in {port.city}</p>
      <div className="flex items-center gap-4 mb-5">
        <p className="text-sm text-muted-foreground">Group size:</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPeople(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-foreground">−</button>
          <span className="w-8 text-center font-black text-foreground text-lg">{people}</span>
          <button onClick={() => setPeople(p => Math.min(10, p + 1))} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-foreground">+</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-border/40 bg-background/40 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2"><Ship className="w-3 h-3" />Ship excursion</div>
          <p className="text-3xl font-black text-foreground">€{shipCost}</p>
        </div>
        <div className="rounded-xl border border-green-400/25 bg-green-400/5 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2"><Navigation className="w-3 h-3" />DIY PortTrip</div>
          <p className="text-3xl font-black text-green-400">€{diyCost}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-green-400/10 border border-green-400/20 px-5 py-3.5 mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-green-400" />
          <span className="text-sm font-bold text-green-400">You save</span>
        </div>
        <span className="text-2xl font-black text-green-400">€{saving}</span>
      </div>
      <Link to={`/planner?port=${encodeURIComponent(port.city)}`} className="block">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl gap-2 font-bold">
          <Sparkles className="w-4 h-4" /> Plan my DIY day →
        </Button>
      </Link>
    </div>
  );
}

export default function PortGuide() {
  const { city } = useParams();
  const decodedCity = decodeURIComponent(city || '');
  const queryClient = useQueryClient();

  const { data: ports = [], isLoading } = useQuery({
    queryKey: ['port', decodedCity],
    queryFn: async () => {
      if (isOffline()) {
        const cached = getCachedPortGuide(decodedCity);
        if (cached) return [cached];
      }
      return base44.entities.CruisePort.list('city', 200).then(all =>
        all.filter(p => p.city?.toLowerCase() === decodedCity.toLowerCase())
      );
    },
  });

  const port = ports[0];

  // Access control — calling unlockPortGuide with check_only just reads, does not write
  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ['portAccess', decodedCity],
    queryFn: async () => {
      const res = await base44.functions.invoke('unlockPortGuide', { port_city: decodedCity, check_only: true });
      return res.data;
    },
    enabled: !!decodedCity,
    retry: false,
  });

  const unlockMutation = useMutation({
    mutationFn: () => base44.functions.invoke('unlockPortGuide', { port_city: decodedCity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portAccess', decodedCity] }),
  });

  // Cache the port guide for offline use once access is granted
  useEffect(() => {
    if (port && accessData?.access) {
      cachePortGuide(decodedCity, port);
    }
  }, [port, accessData?.access, decodedCity]);

  const hasAccess = accessData?.access === true;
  const freeUsed = accessData?.freeUsed ?? 0;
  const freeLimit = accessData?.freeLimit ?? 3;

  useEffect(() => {
    if (!port) return;
    const title = `${port.city} Cruise Port Guide 2025 — Attractions, Transport & Tips | PortTrip`;
    const description = `Complete ${port.city} cruise port guide: transport from terminal, top attractions, local food, safety tips, day plans. Save up to €${(port.avg_ship_excursion_price || 119) - (port.avg_diy_cost || 35)} vs ship excursions.`;
    document.title = title;
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property='${name}']` : `meta[name='${name}']`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); if (prop) el.setAttribute('property', name); else el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'article', true);
    let ld = document.getElementById('ld-json');
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'TravelGuide', name: title, description });
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://porttrip.app/port/${encodeURIComponent(port.city)}`;
    return () => { document.title = 'PortTrip'; ld?.remove(); };
  }, [port]);

  if (isLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!port) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
        <MapPin className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Port guide not found for: {decodedCity}</p>
        <Link to="/ports"><Button variant="outline">Browse all ports</Button></Link>
      </div>
    );
  }

  const flag = FLAG_MAP[port.country_code?.toLowerCase()] || '🌍';

  // Clean all HTML from stored content before rendering
  const cleanPort = {
    ...port,
    description: cleanHtml(port.description),
    attraction_highlights: cleanHtml(port.attraction_highlights),
    local_food: cleanHtml(port.local_food),
    transport_port_to_city: cleanHtml(port.transport_port_to_city),
    transport_within_city: cleanHtml(port.transport_within_city),
    transport_day_trips: cleanHtml(port.transport_day_trips),
    unique_experiences: cleanHtml(port.unique_experiences),
    safety_security: cleanHtml(port.safety_security),
    local_customs: cleanHtml(port.local_customs),
    weather: cleanHtml(port.weather),
    beyond_highlights: cleanHtml(port.beyond_highlights),
    itinerary_first_time: cleanHtml(port.itinerary_first_time),
    itinerary_nature: cleanHtml(port.itinerary_nature),
    itinerary_history: cleanHtml(port.itinerary_history),
    itinerary_relaxation: cleanHtml(port.itinerary_relaxation),
    itinerary_culture: cleanHtml(port.itinerary_culture),
    excursion_1_description: cleanHtml(port.excursion_1_description),
    excursion_2_description: cleanHtml(port.excursion_2_description),
    excursion_3_description: cleanHtml(port.excursion_3_description),
  };

  const plainText = [cleanPort.description, cleanPort.attraction_highlights, cleanPort.local_food, cleanPort.transport_port_to_city].filter(Boolean).join(' ');
  const readTime = Math.ceil(plainText.split(' ').length / 200);

  // Paywall gate — enforced on every load
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border/30 bg-background/95 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center gap-3">
            <Link to="/ports" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xl">{flag}</span>
            <span className="text-sm font-black text-foreground">{port.city}</span>
            <Lock className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </div>
        </header>
        <PortPaywall
          portCity={port.city}
          freeUsed={freeUsed}
          freeLimit={freeLimit}
          canUnlock={freeUsed < freeLimit}
          onUnlock={() => unlockMutation.mutate()}
          isLoading={unlockMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ports" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">{flag}</span>
              <span className="text-sm font-black text-foreground">{port.city}</span>
              {port.region && <span className="text-xs text-muted-foreground hidden sm:block">· {port.region}</span>}
            </div>
          </div>
          <Link to={`/planner?port=${encodeURIComponent(port.city)}`}>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full gap-1.5 font-bold shadow-lg shadow-accent/20 text-xs h-9">
              <Sparkles className="w-3.5 h-3.5" /> Plan with AI
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">

          {/* Main column */}
          <div className="space-y-14 min-w-0">

            {/* HERO */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
                Cruise Port Guide · {port.region || port.country_code?.toUpperCase()}
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.0] tracking-tight mb-5">
                {port.city}<br />
                <span className="text-accent">Cruise Port Guide</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Updated {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                {port.tender_port
                  ? <span className="flex items-center gap-1 text-yellow-400 font-semibold"><AlertTriangle className="w-3.5 h-3.5" />Tender port — add 30min</span>
                  : <span className="flex items-center gap-1 text-green-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" />Dock port</span>
                }
              </div>

              <div className="flex flex-wrap gap-2 mb-7">
                {port.language && <span className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/40 text-muted-foreground">🌐 {port.language}</span>}
                {port.currency && <span className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/40 text-muted-foreground">💱 {port.currency}</span>}
                {port.time_zone && <span className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/40 text-muted-foreground">⏰ {port.time_zone}</span>}
                {port.typical_docking_hours && <span className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/40 text-muted-foreground">⚓ ~{port.typical_docking_hours}h in port</span>}
              </div>

              {cleanPort.description && (
                <div className="prose prose-invert prose-base max-w-none prose-p:text-muted-foreground prose-p:leading-[1.85] prose-p:text-[15px] prose-strong:text-foreground">
                  <ReactMarkdown>{cleanPort.description}</ReactMarkdown>
                </div>
              )}
            </motion.div>

            {/* AI CTA Banner */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Link to={`/planner?port=${encodeURIComponent(port.city)}`}>
                <div className="relative overflow-hidden rounded-2xl border border-accent/35 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-6 flex items-center gap-5 hover:border-accent/55 transition-all group cursor-pointer">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(6,182,212,0.07)_0%,transparent_60%)]" />
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-colors relative z-10">
                    <Sparkles className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <p className="text-base font-black text-foreground mb-1">Plan your {port.city} day with AI in 30 seconds</p>
                    <p className="text-sm text-muted-foreground">Time-stamped itinerary built around your all-aboard time. Safety timer, budget tracker, transport guide — included.</p>
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full gap-2 font-bold shadow-lg shadow-accent/20 flex-shrink-0 relative z-10 hidden md:flex">
                    <Zap className="w-4 h-4" /> Plan now →
                  </Button>
                </div>
              </Link>
            </motion.div>

            {/* ITINERARIES */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <ItineraryTabs port={cleanPort} />
            </motion.div>

            <hr className="border-border/20" />

            {/* ATTRACTIONS */}
            {cleanPort.attraction_highlights && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
                <SectionLabel>Top Attractions</SectionLabel>
                <SectionTitle>What to see in {port.city}</SectionTitle>
                <MarkdownContent content={cleanPort.attraction_highlights} collapsed={false} />
              </motion.div>
            )}

            <hr className="border-border/20" />

            {/* FOOD */}
            {cleanPort.local_food && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                <SectionLabel>Food & Drink</SectionLabel>
                <SectionTitle>What to eat & drink in {port.city}</SectionTitle>
                <MarkdownContent content={cleanPort.local_food} collapsed={false} />
              </motion.div>
            )}

            <hr className="border-border/20" />

            {/* MAP */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.145 }}>
              <SectionLabel>Interactive Map</SectionLabel>
              <SectionTitle>Key locations in {port.city}</SectionTitle>
              <PortGuideMap port={port} />
            </motion.div>

            <hr className="border-border/20" />

            {/* TRANSPORT */}
            {(cleanPort.transport_port_to_city || cleanPort.transport_within_city) && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionLabel>Getting Around</SectionLabel>
                <SectionTitle>Port to city — transport guide</SectionTitle>
                {cleanPort.transport_port_to_city && (
                  <div className="mb-7">
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-accent" /> From the cruise terminal to the city
                    </h3>
                    <MarkdownContent content={cleanPort.transport_port_to_city} collapsed={false} />
                  </div>
                )}
                {cleanPort.transport_within_city && (
                  <div className="mb-7">
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-accent" /> Getting around {port.city}
                    </h3>
                    <MarkdownContent content={cleanPort.transport_within_city} collapsed={false} />
                  </div>
                )}
                {cleanPort.transport_day_trips && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-accent" /> Day trips from {port.city}
                    </h3>
                    <MarkdownContent content={cleanPort.transport_day_trips} collapsed={false} />
                  </div>
                )}
              </motion.div>
            )}

            <hr className="border-border/20" />

            {/* UNIQUE EXPERIENCES */}
            {cleanPort.unique_experiences && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <SectionLabel>Hidden Gems</SectionLabel>
                <SectionTitle>Unique experiences beyond the tourist trail</SectionTitle>
                <MarkdownContent content={cleanPort.unique_experiences} collapsed={false} />
              </motion.div>
            )}

            {/* EXCURSIONS */}
            {(port.excursion_1_title || port.excursion_2_title || port.excursion_3_title) && (
              <>
                <hr className="border-border/20" />
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
                  <SectionLabel>Recommended Excursions</SectionLabel>
                  <SectionTitle>Best tours & day trips in {port.city}</SectionTitle>
                  <div className="space-y-4">
                    {[
                      { title: port.excursion_1_title, description: cleanPort.excursion_1_description },
                      { title: port.excursion_2_title, description: cleanPort.excursion_2_description },
                      { title: port.excursion_3_title, description: cleanPort.excursion_3_description },
                    ].map((exc, i) => (
                      <ExcursionCard key={i} {...exc} index={i} shipPrice={port.avg_ship_excursion_price} diyPrice={port.avg_diy_cost} />
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            <hr className="border-border/20" />

            {/* SAFETY */}
            {cleanPort.safety_security && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <SectionLabel>Safety Guide</SectionLabel>
                <SectionTitle>Is {port.city} safe for cruise passengers?</SectionTitle>
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <p className="text-sm font-semibold text-green-400">Generally safe for tourists with standard precautions</p>
                </div>
                <MarkdownContent content={cleanPort.safety_security} collapsed={false} />
                {port.fire_emergency_nr && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-card/50 border border-border/30 rounded-xl px-4 py-3">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    <span>Emergency number: <strong className="text-foreground">{port.fire_emergency_nr}</strong></span>
                  </div>
                )}
              </motion.div>
            )}

            {/* LOCAL CUSTOMS */}
            {cleanPort.local_customs && (
              <>
                <hr className="border-border/20" />
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
                  <SectionLabel>Local Customs & Etiquette</SectionLabel>
                  <SectionTitle>What to know before you go</SectionTitle>
                  <MarkdownContent content={cleanPort.local_customs} collapsed={false} />
                </motion.div>
              </>
            )}

            <hr className="border-border/20" />

            {/* COMMUNITY */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.195 }}>
              <PortCommunityWidget portCity={port.city} />
            </motion.div>

            <hr className="border-border/20" />

            {/* FAQ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <FAQAccordion port={cleanPort} />
            </motion.div>

            <hr className="border-border/20" />

            {/* BOTTOM CTA */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
              <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-10 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display text-3xl font-black text-foreground mb-3">Ready to plan your {port.city} day?</h3>
                  <p className="text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">
                    Build your personalised {port.city} itinerary in 30 seconds — cruise-aware, offline-ready, budget-optimised.
                  </p>
                  <Link to={`/planner?port=${encodeURIComponent(port.city)}`}>
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full gap-2 px-10 font-black shadow-2xl shadow-accent/25">
                      <Sparkles className="w-5 h-5" /> Build my {port.city} itinerary with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-border/30 bg-card/50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Facts</p>
                <div className="space-y-3">
                  <InfoCard icon={Globe} label="Language" value={port.language} />
                  <InfoCard icon={Wallet} label="Currency" value={port.currency} />
                  <InfoCard icon={Clock} label="Timezone" value={port.time_zone} />
                  <InfoCard icon={Anchor} label="Time in port" value={port.typical_docking_hours ? `~${port.typical_docking_hours} hours` : null} />
                  <InfoCard icon={Ship} label="Port type" value={port.tender_port ? '⛵ Tender port' : '🏗️ Dock port'} accent={port.tender_port} />
                </div>
              </div>
              <CostCalculator port={port} />
              {port.port_address && (
                <div className="rounded-2xl border border-border/30 bg-card/50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Cruise Terminal</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{port.port_address}</p>
                  {port.port_description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{port.port_description}</p>}
                </div>
              )}
              {port.fire_emergency_nr && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Emergency</p>
                    <p className="text-sm font-bold text-foreground">{port.fire_emergency_nr}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}