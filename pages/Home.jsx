import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UpgradeButton from '../components/UpgradeButton';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, useInView } from 'framer-motion';
import {
  Ship, Clock, MapPin, Sparkles, Shield, ChevronRight, Anchor,
  Star, Check, Wifi, Share2, ArrowRight, Navigation, Timer,
  DollarSign, Brain, Zap, Crown, Lock, TrendingDown,
  Calendar, BarChart2, FileText, Luggage, AlertTriangle, X,
  AlertCircle, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── DATA ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50+', label: 'Cruise ports covered', sub: 'and growing weekly' },
  { value: '€85', label: 'Avg saved per port', sub: 'vs ship excursions' },
  { value: '30s', label: 'Full plan generated', sub: 'AI-powered' },
  { value: '4.9★', label: 'User rating', sub: 'from 2,400+ cruisers' },
];

const PRICING = [
  {
    name: 'Free',
    price: '€0',
    period: '',
    icon: MapPin,
    description: 'Explore three destinations of your choice before upgrading.',
    badge: null,
    highlight: false,
    product: null,
    features: [
      { text: 'Pick any 3 port guides', included: true },
      { text: 'See how PortTrip works', included: true },
      { text: 'Great for trying a single trip', included: true },
      { text: 'AI itinerary builder', included: false },
      { text: 'Offline access', included: false },
    ],
    cta: 'Start free',
    ctaLink: '/dashboard',
  },
  {
    name: 'Cruise Pass',
    price: '€12.99',
    period: '/cruise',
    icon: Ship,
    description: 'Unlock every port, every planning tool, for one trip. No subscription.',
    badge: null,
    highlight: false,
    product: 'cruise_pass',
    features: [
      { text: 'All ports in one cruise unlocked', included: true },
      { text: 'Full AI itinerary builder', included: true },
      { text: 'Transport plans and cost breakdown', included: true },
      { text: 'Cruise-safe return logic', included: true },
      { text: 'Offline access for your trip', included: true },
      { text: 'No subscription', included: true },
    ],
    cta: 'Buy Cruise Pass',
  },
  {
    name: 'Pro',
    price: '€14.99',
    period: '/mo',
    yearlyPrice: '€9.99/mo billed yearly',
    icon: Crown,
    description: 'Unlimited cruises, unlimited port guides, and the full AI planning engine.',
    badge: 'Most popular',
    highlight: true,
    product: 'pro_monthly',
    productYearly: 'pro_yearly',
    features: [
      { text: 'Unlimited cruises and port plans', included: true },
      { text: '1-click itinerary builder', included: true },
      { text: 'Advanced route optimization', included: true },
      { text: 'Smarter transport and timing logic', included: true },
      { text: 'Ship tour vs DIY comparisons', included: true },
      { text: 'Premium cruise planning assistant', included: true },
    ],
    cta: 'Start Pro',
  },
  {
    name: 'Ultimate',
    price: '€24.99',
    period: '/mo',
    yearlyPrice: '€16.99/mo billed yearly',
    icon: Sparkles,
    description: 'The most advanced PortTrip experience with exports, sharing, and premium planning.',
    badge: null,
    highlight: false,
    product: 'ultimate_monthly',
    productYearly: 'ultimate_yearly',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'PDF export', included: true },
      { text: 'Shareable itineraries', included: true },
      { text: 'Premium advanced planning tools', included: true },
      { text: 'Highest-priority new features', included: true },
      { text: 'Best experience for power users', included: true },
    ],
    cta: 'Start Ultimate',
  },
];

const UPSELLS = [
  {
    name: 'Perfect Day Plan',
    price: '€2.99',
    desc: 'Hyper-optimized itinerary built around your exact preferences, budget, and mobility. One port, fully perfected.',
    icon: Sparkles,
  },
  {
    name: 'Skip the Ship Tours Pack',
    price: '€4.99',
    desc: 'Curated cheaper alternatives for every ship excursion in your cruise. Average saving: €85 per person per port.',
    icon: TrendingDown,
  },
];

const FEATURES = [
  { icon: Brain, title: 'Cruise-Trained AI Planner', desc: 'Knows every port. Plans around your all-aboard time, preferences, and budget. Not a template — an intelligent private planner.', locked: false },
  { icon: Timer, title: 'Return-to-Ship Safety System', desc: 'Real-time countdown to your must-leave time. Factors in tender queues and traffic. You will never miss the ship.', locked: false },
  { icon: TrendingDown, title: 'Beat Ship Excursion Prices', desc: 'Side-by-side: ship tour €120 vs DIY €35. Savings calculated automatically. Average €85/port, €400+ per cruise.', locked: false },
  { icon: Navigation, title: 'Exact Transport Plans', desc: 'Step-by-step instructions between every stop. Costs, journey times, risk ratings. No guessing, no Google Maps panic.', locked: true },
  { icon: BarChart2, title: 'Live Expense Tracker', desc: 'Log spending as you go. Budget vs actual. See every euro — before and after you spend it.', locked: true },
  { icon: Wifi, title: 'Full Offline Mode', desc: 'Auto-caches your plan, maps, and guides before you sail. Works at sea. Zero roaming charges.', locked: true },
  { icon: Share2, title: 'Group Coordination', desc: 'Share your itinerary. Everyone sees the plan. Coordinate meeting points without WhatsApp chaos.', locked: true },
  { icon: FileText, title: 'PDF Export & Print', desc: 'Beautifully formatted PDF of your full port day plan. Print it. Always have it.', locked: true },
];

const TESTIMONIALS = [
  { quote: "Saved €340 across 5 ports on our Mediterranean cruise. The safety timer gave me peace of mind I didn't know I needed.", author: "Maria K.", role: "12 cruises · Cruise veteran", stars: 5 },
  { quote: "The AI built us a perfect Alesund day — history, food, fjord views — timed to the minute. Better than any travel agent.", author: "James & Claire T.", role: "First-time cruisers", stars: 5 },
  { quote: "Shared the plan with 9 friends. Everyone coordinated perfectly. No one was late. Non-negotiable on every cruise now.", author: "Sophie L.", role: "Group cruise organiser", stars: 5 },
  { quote: "Compared ship excursions to PortTrip's DIY routes. Saved €95 per person, every single port. Completely changed how I cruise.", author: "David & Anna B.", role: "Budget travellers", stars: 5 },
  { quote: "As a senior with mobility limits, the AI planned a perfect gentle day in Kotor. Knew exactly what I could handle. Incredible.", author: "Robert M.", role: "Retired · 8 cruises", stars: 5 },
  { quote: "The itinerary had exact taxi costs, which café to stop at, when to leave. Like having a local friend who knows cruise schedules.", author: "Emma D.", role: "Family cruiser · 3 kids", stars: 5 },
];

// Simulated itinerary preview data
const DEMO_ITINERARY = [
  { time: '08:30', label: 'Disembark at Barcelona Cruise Terminal', type: 'ship', note: null },
  { time: '08:45', label: 'Taxi to Gothic Quarter', cost: '€12', duration: '10 min', type: 'transit', note: null },
  { time: '09:00', label: 'Gothic Quarter & Cathedral', cost: '€0', duration: '60 min', type: 'stop', note: 'Arrive before crowds' },
  { time: '10:15', label: 'Walk to La Boqueria Market', cost: null, duration: '8 min', type: 'transit', note: null },
  { time: '10:30', label: 'La Boqueria — coffee & jamón', cost: '€8', duration: '40 min', type: 'stop', note: null },
  { time: '11:20', label: 'Metro L3 to Sagrada Família', cost: '€2.40', duration: '15 min', type: 'transit', note: null },
  { time: '11:40', label: 'Sagrada Família exterior', cost: '€0', duration: '30 min', type: 'stop', note: 'Skip the queue — exterior only' },
  { time: '13:00', label: '⚠️ Return to ship begins', type: 'alert', note: 'Must leave now — 90 min safety buffer' },
];

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function AnimatedStat({ value, label, sub, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.5 }} className="text-center">
      <p className="text-4xl md:text-5xl font-black text-accent mb-2 font-display">{value}</p>
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </motion.div>
  );
}

function ItineraryPreview() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 shadow-2xl shadow-black/40 overflow-hidden">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/30 bg-background/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-4 h-7 rounded-lg bg-secondary/60 flex items-center px-3 gap-2">
          <Anchor className="w-3 h-3 text-accent" />
          <span className="text-xs text-muted-foreground/70">porttrip.app · Barcelona · All-aboard 17:00</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
          <Timer className="w-3 h-3" /> 4h 15m left
        </div>
      </div>
      {/* Itinerary rows */}
      <div className="p-5 space-y-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-black text-foreground">Barcelona — Your Day Plan</p>
            <p className="text-xs text-muted-foreground">AI-optimised · Culture + Food · Budget €45</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-400/10 px-2.5 py-1 rounded-full">
            <TrendingDown className="w-3 h-3" /> Save €85 vs ship tour
          </div>
        </div>
        {DEMO_ITINERARY.map((row, i) => (
          <div key={i} className={cn(
            "flex items-start gap-3 rounded-xl px-3 py-2.5 text-xs",
            row.type === 'alert' ? "bg-red-500/10 border border-red-500/20" :
            row.type === 'ship' ? "bg-accent/8 border border-accent/15" :
            row.type === 'transit' ? "bg-transparent" :
            "bg-card/60 border border-border/20"
          )}>
            <span className={cn("font-black w-11 flex-shrink-0 mt-0.5",
              row.type === 'alert' ? "text-red-400" :
              row.type === 'transit' ? "text-muted-foreground/50" :
              "text-accent"
            )}>{row.time}</span>
            <div className="flex-1 min-w-0">
              <span className={cn("font-semibold", row.type === 'alert' ? "text-red-400" : row.type === 'transit' ? "text-muted-foreground/60" : "text-foreground")}>{row.label}</span>
              {row.note && <p className="text-muted-foreground/60 mt-0.5">{row.note}</p>}
            </div>
            {(row.cost || row.duration) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {row.cost && <span className="text-green-400 font-bold">{row.cost}</span>}
                {row.duration && <span className="text-muted-foreground/50">{row.duration}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaywallTeaser() {
  return (
    <div className="relative rounded-2xl border border-accent/30 bg-gradient-to-b from-card/80 to-background overflow-hidden">
      {/* Blurred fake content */}
      <div className="px-6 pt-6 pb-2 space-y-2 blur-sm select-none pointer-events-none">
        {['11:40 — Sagrada Família tickets (skip-the-line trick)', '13:15 — Lunch at hidden local spot, €14pp', '14:30 — Barceloneta Beach (20 min walk)', '15:45 — ⚠️ Return to terminal now — taxi recommended'].map((t, i) => (
          <div key={i} className="h-9 rounded-lg bg-card/70 border border-border/20 flex items-center px-3 text-xs text-muted-foreground">{t}</div>
        ))}
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/98 via-background/80 to-transparent px-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-lg font-black text-foreground mb-1">Your full itinerary is ready.</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">Includes exact timings, transport instructions, return-to-ship alert, and full cost breakdown.</p>
        <div className="space-y-2 text-left mb-6 w-full max-w-xs">
          {['Exact timings for every stop', 'Transport plan between each step', 'Return-to-ship safety buffer', 'Full cost breakdown — €45 total'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />{t}
            </div>
          ))}
        </div>
        <Link to="/dashboard">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 font-black gap-2 shadow-xl shadow-accent/25 h-12">
            <Zap className="w-4 h-4" /> Unlock my perfect day
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-3">Cruise Pass €9.99 · Pro €12.99/mo</p>
      </div>
    </div>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────

export default function Home() {
  const [billingYearly, setBillingYearly] = useState(false);
  // billingYearly toggles Pro/Ultimate to yearly price IDs

  const { data: ports = [] } = useQuery({
    queryKey: ['cruisePorts', 'featured'],
    queryFn: () => base44.entities.CruisePort.list('city', 6),
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
              <Anchor className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-black text-foreground tracking-tight text-lg">PortTrip</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <Link to="/ports" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Port Guides</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">My Cruises</Link>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-foreground">Log in</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 font-bold shadow-lg shadow-accent/25 text-sm h-9">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-accent/6 blur-[100px]" />
          <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-xs font-bold mb-8">
              <Sparkles className="w-3 h-3" /> The private shore excursion planner for cruisers
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.92] tracking-tight mb-7"
          >
            You have 6–8 hours<br />
            <span className="text-accent">in port.</span><br />
            <span className="text-foreground/80">Don't waste it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto font-light"
          >
            AI builds your time-stamped port day plan in 30 seconds. Beat ship excursion prices. Never miss all-aboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Link to="/dashboard">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 font-black gap-2 shadow-2xl shadow-accent/30 h-14 text-base">
                <Zap className="w-5 h-5" /> Build my perfect port day
              </Button>
            </Link>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium">
              See how it works <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex flex-wrap items-center justify-center gap-5 mb-16">
            {['No ship excursion markup', 'Safety buffer built-in', 'Works offline at sea'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Check className="w-3 h-3 text-accent" />{t}
              </span>
            ))}
          </motion.div>

          {/* Itinerary mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative max-w-3xl mx-auto"
          >
            <ItineraryPreview />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-accent/15 blur-2xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/30 bg-card/20 py-14 px-6 mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => <AnimatedStat key={s.label} {...s} delay={i * 0.1} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">From dock time to perfect day.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Four steps. Thirty seconds. No ship excursion markup.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: '01', icon: Clock, title: 'Enter your cruise times', desc: 'Dock time, all-aboard time, and which port. Takes 20 seconds.' },
              { n: '02', icon: Sparkles, title: 'Pick your style', desc: 'First time, nature, culture, food, relax — or max everything. AI adapts.' },
              { n: '03', icon: Brain, title: 'AI generates your plan', desc: 'Time-stamped itinerary, transport between every stop, cost breakdown, safety buffer.' },
              { n: '04', icon: TrendingDown, title: 'Save €85+ per port', desc: 'See exactly what the ship charges vs your DIY route. Every port, every time.' },
            ].map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-border/30 bg-card/40 p-6 hover:border-accent/20 transition-all group">
                <div className="text-6xl font-black text-accent/8 font-display leading-none mb-5">{step.n}</div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-black text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHIP VS DIY CALCULATOR */}
      <section className="py-20 px-6 border-t border-border/30 bg-card/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">The Real Cost</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">What the ship doesn't tell you.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { port: 'Barcelona', ship: 119, diy: 32, highlight: false },
              { port: 'Dubrovnik', ship: 89, diy: 18, highlight: true },
              { port: 'Santorini', ship: 145, diy: 48, highlight: false },
            ].map((p, i) => (
              <motion.div key={p.port} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={cn("rounded-2xl border p-6", p.highlight ? "border-accent/30 bg-accent/5" : "border-border/30 bg-card/40")}>
                <p className="text-base font-black text-foreground mb-5">{p.port}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ship className="w-3.5 h-3.5" /> Ship excursion
                    </div>
                    <span className="text-sm font-bold text-foreground line-through opacity-50">€{p.ship}pp</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Navigation className="w-3.5 h-3.5" /> DIY with PortTrip
                    </div>
                    <span className="text-sm font-black text-green-400">€{p.diy}pp</span>
                  </div>
                  <div className="pt-3 border-t border-border/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">You save</span>
                    <span className="text-2xl font-black text-accent">€{p.ship - p.diy}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">On a 5-port cruise, that's <strong className="text-foreground">€400+ back in your pocket.</strong></p>
        </div>
      </section>

      {/* PAYWALL TEASER */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">What you get</p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-5 leading-tight">
                Your full itinerary is ready.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Not a template. A private plan built around your exact ship schedule, preferences, and budget.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Clock, title: 'Exact timings for every stop', desc: '08:45 taxi, 09:00 arrive, 10:30 coffee — the full picture.' },
                  { icon: Navigation, title: 'Transport between every step', desc: 'Taxi cost, bus number, walk time, risk rating — all included.' },
                  { icon: AlertTriangle, title: 'Return-to-ship safety alert', desc: 'Dynamic buffer based on port distance and tender status.' },
                  { icon: DollarSign, title: 'Full cost breakdown', desc: 'Know exactly what you\'ll spend before you spend it.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PaywallTeaser />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-card/20 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Platform</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">Everything built for cruise days.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Not a generic travel app. Every feature exists because of the specific constraints of a port day.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border/30 bg-card/40 p-5 group hover:border-accent/20 hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <f.icon className="w-4 h-4 text-accent" />
                  </div>
                  {f.locked && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-secondary px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> Pro
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-foreground mb-1.5 leading-tight">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">One port day pays for itself.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Save €85 on your first port. PortTrip costs less than one coffee at the terminal.</p>
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={billingYearly ? 'text-sm text-muted-foreground' : 'text-sm font-bold text-foreground'}>Monthly</span>
              <button
                onClick={() => setBillingYearly(b => !b)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingYearly ? 'bg-accent' : 'bg-secondary'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${billingYearly ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={billingYearly ? 'text-sm font-bold text-foreground' : 'text-sm text-muted-foreground'}>Yearly</span>
              {billingYearly && <span className="text-xs font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Save ~33%</span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={cn('relative rounded-2xl border p-6 flex flex-col',
                  plan.highlight ? 'border-accent/50 bg-gradient-to-b from-accent/8 to-card/60 shadow-2xl shadow-accent/10' : 'border-border/40 bg-card/50'
                )}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-black bg-accent text-accent-foreground px-4 py-1 rounded-full shadow-lg shadow-accent/30">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-black text-foreground mb-1">{plan.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {billingYearly && plan.productYearly
                        ? plan.yearlyPrice?.split('/')[0]
                        : plan.price}
                    </span>
                    <span className="text-muted-foreground text-xs">{plan.period}</span>
                  </div>
                  {billingYearly && plan.yearlyPrice && (
                    <p className="text-[10px] text-green-400 font-bold mt-0.5">{plan.yearlyPrice}</p>
                  )}
                </div>
                <div className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className={cn('flex items-start gap-2 text-xs', f.included ? 'text-foreground' : 'text-muted-foreground/40')}>
                      {f.included ? <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 text-border mt-0.5 flex-shrink-0" />}
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
                {plan.product ? (
                  <UpgradeButton
                    product={billingYearly && plan.productYearly ? plan.productYearly : plan.product}
                    label={plan.cta}
                    className={cn('w-full h-10 rounded-xl text-xs',
                      plan.highlight ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  />
                ) : (
                  <Link to="/dashboard">
                    <Button className={cn('w-full h-10 font-black rounded-xl text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Micro-upsells */}
          <div className="rounded-2xl border border-border/30 bg-card/30 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Add-ons available at checkout</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {UPSELLS.map((u, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/20 bg-card/40 p-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <u.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-foreground">{u.name}</p>
                      <span className="text-sm font-black text-accent">{u.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Cancel anytime · No hidden fees · Secure payment
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 border-t border-border/30 bg-card/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Real Cruisers</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">They came back. On time. Richer.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/30 bg-card/60 p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-xs font-black text-accent flex-shrink-0">
                    {t.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PORT GUIDES PREVIEW */}
      {ports.length > 0 && (
        <section className="py-24 px-6 border-t border-border/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Port Intelligence</p>
                <h2 className="font-display text-4xl font-black text-foreground">Deep-dive port guides</h2>
                <p className="text-muted-foreground mt-2 max-w-lg">Transport, food, safety, hidden gems, and AI itineraries for every cruise port.</p>
              </div>
              <Link to="/ports">
                <Button variant="outline" className="gap-2 rounded-full border-border/60 font-semibold hidden md:flex">
                  All ports <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ports.slice(0, 6).map((port, i) => (
                <Link key={port.id} to={`/port/${encodeURIComponent(port.city)}`}>
                  <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="rounded-2xl border border-border/30 bg-card/50 p-5 hover:border-accent/30 hover:bg-card/70 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-black text-foreground group-hover:text-accent transition-colors">{port.city}</h3>
                        <p className="text-xs text-muted-foreground">{port.region || port.country_code?.toUpperCase()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors mt-0.5" />
                    </div>
                    {port.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {port.description.replace(/<[^>]+>/g, '').slice(0, 120)}…
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {port.typical_docking_hours && <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">⚓ {port.typical_docking_hours}h in port</span>}
                      {port.tender_port && <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Tender</span>}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/ports">
                <Button variant="outline" className="gap-2 rounded-full border-border/60 font-semibold">
                  Browse all port guides <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-32 px-6 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.07)_0%,transparent_65%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/20">
              <Anchor className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-black text-foreground mb-6 leading-tight">
              Your best port day<br />starts here.
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Stop wasting money on ship excursions. Stop guessing transport. Stop worrying about missing all-aboard. Start planning like a pro.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-14 font-black gap-2 shadow-2xl shadow-accent/30 text-lg h-16">
                <Zap className="w-6 h-6" /> Build my perfect port day
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-5">Cruise Pass €9.99 · Pro €12.99/mo · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/20 py-12 px-6 bg-card/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center">
              <Anchor className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span className="font-black text-foreground">PortTrip</span>
            <span className="text-xs text-muted-foreground">AI Cruise Intelligence</span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/ports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Port Guides</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Cruises</Link>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PortTrip. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}