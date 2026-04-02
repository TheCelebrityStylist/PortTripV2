import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Luggage, Sparkles, Loader2, Check, Star, ChevronDown, ChevronUp, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
  'Documents & Money': '🪪',
  'Clothing': '👕',
  'Footwear': '👟',
  'Sun & Heat': '🌞',
  'Tech & Navigation': '📱',
  'Health & Safety': '🏥',
  'Beach & Water': '🏖️',
  'Food & Drinks': '🥤',
};

export default function PackingList({ plan, blocks }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (name) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  const generate = async () => {
    if (!plan?.port_city) return;
    setLoading(true);
    setChecked(new Set());
    setData(null);

    const activities = (blocks || []).filter(b => b.block_type === 'stop').map(b => b.title).join(', ');

    const result = await base44.functions.invoke('portChat', {
      mode: 'packing',
      plan,
      messages: [{ role: 'user', content: `Generate a detailed packing list for my ${plan.port_city} cruise port day.` }],
      context: `Activities: ${activities || 'general sightseeing'}. Group: ${plan.group_type || 'couple'}. Style: ${plan.travel_mode || 'first_time'}.`,
    });

    const packing = result?.data?.packing;
    if (packing?.categories) {
      setData(packing);
      setExpanded(new Set(packing.categories.map(c => c.name)));
    }
    setLoading(false);
  };

  const toggle = (key) => {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const totalItems = data?.categories?.reduce((s, c) => s + c.items.length, 0) || 0;
  const checkedCount = checked.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  if (!plan?.port_city) return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <Luggage className="w-10 h-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">Set up your port day first</p>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Luggage className="w-8 h-8 text-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <Loader2 className="w-3.5 h-3.5 text-accent-foreground animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">Building your packing list…</p>
        <p className="text-xs text-muted-foreground mt-1">Analysing {plan.port_city} climate & your activities</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center shadow-xl shadow-accent/10">
        <Luggage className="w-10 h-10 text-accent" />
      </div>
      <div>
        <h3 className="text-lg font-black text-foreground mb-2">AI Packing List</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Tailored to {plan.port_city}'s climate, your planned activities, and your travel style. Never forget an essential item.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        {['Climate-aware', 'Activity-specific', 'Essentials flagged'].map(t => (
          <span key={t} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
            <Check className="w-3 h-3 text-accent" />{t}
          </span>
        ))}
      </div>
      <Button onClick={generate} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-bold rounded-xl px-8 shadow-lg shadow-accent/20">
        <Sparkles className="w-4 h-4" /> Generate packing list
      </Button>
    </div>
  );

  return (
    <div className="space-y-5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground">Packing for {plan.port_city}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {checkedCount}/{totalItems} items packed
            {checkedCount === totalItems && totalItems > 0 && ' · ✅ All packed!'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={generate} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{checkedCount} packed</span>
          <span>{totalItems - checkedCount} remaining</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {(data?.categories || []).map((cat, ci) => {
          const isOpen = expanded.has(cat.name);
          const catDone = cat.items.filter((_, ii) => checked.has(`${ci}-${ii}`)).length;
          const allDone = catDone === cat.items.length;
          const emoji = CATEGORY_ICONS[cat.name] || cat.emoji || '📦';

          return (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.04 }}
              className={cn("rounded-2xl border overflow-hidden transition-all", allDone ? "border-green-400/20 bg-green-400/3" : "border-border/30 bg-card/40")}>
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors" onClick={() => toggleExpand(cat.name)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div className="text-left">
                    <p className={cn("text-sm font-bold", allDone ? "text-green-400" : "text-foreground")}>{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{catDone}/{cat.items.length} packed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {allDone && <Check className="w-4 h-4 text-green-400" />}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="divide-y divide-border/20 border-t border-border/20">
                      {cat.items.map((item, ii) => {
                        const key = `${ci}-${ii}`;
                        const isDone = checked.has(key);
                        return (
                          <button key={ii} onClick={() => toggle(key)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors">
                            <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all", isDone ? "bg-green-400 border-green-400" : "border-border/50")}>
                              {isDone && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={cn("text-sm", isDone ? "line-through text-muted-foreground/40" : "text-foreground font-medium")}>{item.item}</span>
                                {item.essential && !isDone && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                              </div>
                              {item.reason && <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{item.reason}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {checkedCount === totalItems && totalItems > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-green-400/30 bg-green-400/8 p-5 text-center">
          <p className="text-2xl mb-2">🎒</p>
          <p className="text-green-400 font-black text-base">All packed!</p>
          <p className="text-xs text-muted-foreground mt-1">Have an amazing day in {plan.port_city}!</p>
        </motion.div>
      )}
    </div>
  );
}