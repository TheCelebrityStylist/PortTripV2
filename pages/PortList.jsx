import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, Anchor, ArrowLeft, MapPin, ChevronRight, Sparkles, Globe, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FLAG_MAP = {
  no: '🇳🇴', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷', gr: '🇬🇷', hr: '🇭🇷',
  pt: '🇵🇹', mt: '🇲🇹', me: '🇲🇪', tr: '🇹🇷', de: '🇩🇪', gb: '🇬🇧',
  nl: '🇳🇱', dk: '🇩🇰', se: '🇸🇪', fi: '🇫🇮', is: '🇮🇸',
  bs: '🇧🇸', mx: '🇲🇽', us: '🇺🇸', bb: '🇧🇧',
};

const FREE_LIMIT = 3;

export default function PortList() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');

  const { data: ports = [], isLoading } = useQuery({
    queryKey: ['cruisePorts', 'all'],
    queryFn: () => base44.entities.CruisePort.list('city', 500),
  });

  const { data: userAccessData } = useQuery({
    queryKey: ['userAccess'],
    queryFn: async () => {
      try {
        const me = await base44.auth.me();
        if (!me) return { isPaid: false, planTier: 'free', freeGuides: [] };
        const users = await base44.entities.User.filter({ id: me.id });
        const userData = users?.[0];
        const planTier = userData?.plan_tier || 'free';
        return {
          isPaid: planTier !== 'free',
          planTier,
          freeGuides: userData?.free_port_guides || [],
        };
      } catch {
        return { isPaid: false, planTier: 'free', freeGuides: [] };
      }
    },
    retry: false,
  });

  const isPaid = userAccessData?.isPaid || false;
  const freeGuides = userAccessData?.freeGuides || [];
  const freeUsed = freeGuides.length;

  const filtered = ports.filter(p => {
    const matchSearch = !search || p.city?.toLowerCase().includes(search.toLowerCase()) || p.region?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'All' || p.region?.toLowerCase().includes(region.toLowerCase());
    return matchSearch && matchRegion;
  });

  const regions = ['All', ...new Set(ports.map(p => p.region).filter(Boolean))].slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <h1 className="text-base font-black text-foreground">Port Guides</h1>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{filtered.length} ports</span>
          </div>
          <div className="flex items-center gap-3">
            {!isPaid && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {freeUsed}/{FREE_LIMIT} free guides used
              </span>
            )}
            <Link to="/dashboard">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> Plan with AI
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {!isPaid && freeUsed < FREE_LIMIT && (
          <div className="mb-6 rounded-2xl border border-accent/25 bg-accent/5 px-5 py-4 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Choose your {FREE_LIMIT} free port guides wisely</p>
              <p className="text-xs text-muted-foreground">You have {FREE_LIMIT - freeUsed} free {FREE_LIMIT - freeUsed === 1 ? 'pick' : 'picks'} remaining. Unlocked guides stay yours permanently.</p>
            </div>
          </div>
        )}

        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-11 bg-card border-border/40 rounded-2xl h-12 text-sm shadow-sm focus:border-accent/40"
              placeholder="Search any cruise port or region…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {regions.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {regions.map(r => (
                <button key={r} onClick={() => setRegion(r)}
                  className={cn("text-xs px-4 py-1.5 rounded-full border font-semibold transition-all",
                    region === r ? "bg-accent text-accent-foreground border-accent" : "border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-card/40 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">{search ? `No ports found for "${search}"` : 'No port data loaded yet.'}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((port, i) => {
              const flag = FLAG_MAP[port.country_code?.toLowerCase()] || '🌍';
              const plain = port.description?.replace(/<[^>]+>/g, '') || '';
              const isUnlocked = isPaid || freeGuides.includes(port.city);

              return (
                <Link key={port.id} to={`/port/${encodeURIComponent(port.city)}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    className={cn(
                      "rounded-2xl border bg-card/50 p-5 transition-all group cursor-pointer h-full flex flex-col",
                      isUnlocked
                        ? "border-border/30 hover:border-accent/30 hover:bg-card/70"
                        : "border-border/20 hover:border-border/40"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <h3 className={cn("text-base font-black leading-tight transition-colors",
                            isUnlocked ? "text-foreground group-hover:text-accent" : "text-foreground/70"
                          )}>{port.city}</h3>
                          <p className="text-xs text-muted-foreground">{port.region || port.country_code?.toUpperCase()}</p>
                        </div>
                      </div>
                      {isUnlocked
                        ? <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent transition-colors mt-1 flex-shrink-0" />
                        : <Lock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-1" />
                      }
                    </div>

                    {plain && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-3">
                        {plain.slice(0, 120)}…
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-auto flex-wrap">
                      {port.typical_docking_hours && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">⚓ {port.typical_docking_hours}h</span>
                      )}
                      {port.tender_port && (
                        <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Tender</span>
                      )}
                      {port.currency && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{port.currency}</span>
                      )}
                      {isUnlocked && (
                        <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full ml-auto">✓ Unlocked</span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}