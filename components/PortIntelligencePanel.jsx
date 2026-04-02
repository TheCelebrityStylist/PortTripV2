import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Shield, Bus, Utensils, Sun, ChevronDown, ExternalLink, Info, Star, MapPin, Globe, Compass, Mountain, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cleanHtml } from '../utils/cleanContent';

const SECTION_CONFIG = [
  {
    key: 'transport_port_to_city',
    icon: Bus,
    label: 'Getting from Port to City',
    tagline: 'Your first step ashore — made easy',
    accent: true,
  },
  {
    key: 'transport_within_city',
    icon: Compass,
    label: 'Getting Around',
    tagline: 'Navigate the city like a local',
  },
  {
    key: 'attraction_highlights',
    icon: MapPin,
    label: 'Top Attractions',
    tagline: "The must-sees — and what the guidebooks miss",
  },
  {
    key: 'local_food',
    icon: Utensils,
    label: 'Food & Drink',
    tagline: 'Eat where the locals eat',
  },
  {
    key: 'unique_experiences',
    icon: Star,
    label: 'Hidden Gems',
    tagline: 'Off the beaten track — worth every detour',
    accent: true,
  },
  {
    key: 'safety_security',
    icon: Shield,
    label: 'Safety & Smart Travel',
    tagline: 'Stay safe, avoid the classic scams',
  },
  {
    key: 'local_customs',
    icon: Globe,
    label: 'Culture & Etiquette',
    tagline: 'Blend in, show respect, travel smarter',
  },
  {
    key: 'weather',
    icon: Sun,
    label: 'Weather & When to Visit',
    tagline: 'Month-by-month — pack right',
  },
  {
    key: 'transport_day_trips',
    icon: Mountain,
    label: 'Day Trips',
    tagline: 'Venture beyond the port city',
  },
  {
    key: 'beyond_highlights',
    icon: Coffee,
    label: 'For the Repeat Visitor',
    tagline: 'Seen the sights? Go deeper',
  },
];

function BlogSection({ icon: Icon, label, tagline, content, accent = false }) {
  const [open, setOpen] = useState(false);
  if (!content || content.length < 20) return null;

  return (
    <article className={cn(
      'rounded-2xl border overflow-hidden transition-all',
      accent ? 'border-accent/25 bg-gradient-to-br from-accent/5 to-transparent' : 'border-border/30 bg-card/40'
    )}>
      {/* Section header — always visible, acts as teaser */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
            accent ? 'bg-accent/15' : 'bg-secondary/60')}>
            <Icon className={cn('w-4 h-4', accent ? 'text-accent' : 'text-muted-foreground')} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('text-base font-black leading-tight', accent ? 'text-accent' : 'text-foreground')}>{label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 italic">{tagline}</p>
          </div>
        </div>

        {/* Teaser paragraph — first ~200 chars as a proper lead */}
        {!open && (
          <div className="mt-3 prose-teaser">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {content.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/^-\s*/gm, '').slice(0, 220)}…
            </p>
          </div>
        )}
      </div>

      {/* Full editorial content */}
      {open && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4">
          <div className={cn(
            'prose prose-sm max-w-none',
            'prose-headings:font-black prose-headings:text-foreground prose-headings:text-sm prose-headings:mb-2 prose-headings:mt-4',
            'prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:text-sm prose-p:mb-3',
            'prose-strong:text-foreground prose-strong:font-bold',
            'prose-li:text-foreground/85 prose-li:text-sm prose-li:leading-relaxed',
            'prose-ul:my-2 prose-ol:my-2',
            'prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
          )}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold border-t transition-colors',
          accent
            ? 'border-accent/20 text-accent hover:bg-accent/5'
            : 'border-border/20 text-muted-foreground hover:text-foreground hover:bg-secondary/30'
        )}
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        {open ? 'Collapse' : 'Read full guide'}
      </button>
    </article>
  );
}

export default function PortIntelligencePanel({ port, portCity }) {
  // Clean all HTML before rendering
  const cleanedPort = port ? {
    ...port,
    ...Object.fromEntries(
      Object.entries(port).map(([k, v]) => [k, typeof v === 'string' ? cleanHtml(v) : v])
    )
  } : null;

  if (!cleanedPort) {
    return (
      <div className="rounded-2xl border border-border/30 bg-card/40 p-6 text-center space-y-2">
        <Info className="w-5 h-5 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">No port guide found for <strong>{portCity}</strong>.</p>
        <p className="text-[11px] text-muted-foreground">
          Go to <Link to="/admin/import" className="text-accent underline">Admin → Generate content</Link> to add a guide.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero header */}
      <div className="rounded-2xl border border-border/30 bg-card/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-foreground font-display">{port.city} Port Guide</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {port.region} · {port.language} · {port.currency}
              {port.tender_port && <span className="ml-2 text-yellow-400 font-bold">⚓ Tender port</span>}
              {port.typical_docking_hours && <span className="ml-2">· ~{port.typical_docking_hours}h in port</span>}
            </p>
            {port.description && (
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed line-clamp-3">
                {port.description.replace(/\*\*/g, '').slice(0, 240)}…
              </p>
            )}
          </div>
          <Link to={`/port/${encodeURIComponent(port.city)}`} target="_blank"
            className="flex-shrink-0 flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 bg-accent/10 px-2.5 py-1.5 rounded-lg font-bold">
            <ExternalLink className="w-3 h-3" /> Full guide
          </Link>
        </div>

        {/* Savings bar */}
        {port.avg_ship_excursion_price > 0 && port.avg_diy_cost > 0 && (
          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-xl bg-secondary/50 border border-border/20 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">Ship tour avg</p>
              <p className="text-sm font-black text-foreground">€{port.avg_ship_excursion_price}</p>
            </div>
            <div className="flex-1 rounded-xl bg-accent/10 border border-accent/20 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">DIY with PortTrip</p>
              <p className="text-sm font-black text-accent">€{port.avg_diy_cost}</p>
            </div>
            <div className="flex-1 rounded-xl bg-green-400/10 border border-green-400/20 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">You save</p>
              <p className="text-sm font-black text-green-400">€{port.avg_ship_excursion_price - port.avg_diy_cost}</p>
            </div>
          </div>
        )}
      </div>

      {/* Editorial sections */}
      {SECTION_CONFIG.map(cfg => (
        <BlogSection
          key={cfg.key}
          icon={cfg.icon}
          label={cfg.label}
          tagline={cfg.tagline}
          content={cleanedPort[cfg.key]}
          accent={cfg.accent}
        />
      ))}
    </div>
  );
}