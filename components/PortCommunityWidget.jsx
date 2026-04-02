import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare, AlertTriangle, Clock, Utensils, Bus, Lightbulb, ThumbsUp, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIP_CONFIG = {
  tip:       { icon: Lightbulb, label: 'Insider Tip',   color: 'text-accent bg-accent/10 border-accent/20' },
  warning:   { icon: AlertTriangle, label: 'Warning',   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  crowded:   { icon: MessageSquare, label: 'Crowds',    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  hours:     { icon: Clock, label: 'Opening Hours',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  food:      { icon: Utensils, label: 'Food Find',      color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  transport: { icon: Bus, label: 'Transport',           color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>
          <Star className={cn('w-5 h-5 transition-colors', (hover || value) >= n ? 'text-yellow-400 fill-yellow-400' : 'text-border')} />
        </button>
      ))}
    </div>
  );
}

export default function PortCommunityWidget({ portCity }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tip_type: 'tip', content: '', author_name: '', rating: 0 });
  const queryClient = useQueryClient();

  const { data: tips = [] } = useQuery({
    queryKey: ['portTips', portCity],
    queryFn: () => base44.entities.PortTip.filter({ port_city: portCity }, '-created_date', 20),
  });

  const addTip = useMutation({
    mutationFn: (data) => base44.entities.PortTip.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portTips', portCity] });
      setShowForm(false);
      setForm({ tip_type: 'tip', content: '', author_name: '', rating: 0 });
    },
  });

  const markHelpful = useMutation({
    mutationFn: ({ id, count }) => base44.entities.PortTip.update(id, { helpful_count: count + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portTips', portCity] }),
  });

  const ratings = tips.filter(t => t.rating > 0);
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, t) => s + t.rating, 0) / ratings.length).toFixed(1) : null;

  return (
    <section className="space-y-5">
      {/* Header + avg rating */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Community Tips</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time reports from fellow cruise passengers</p>
        </div>
        <div className="flex items-center gap-3">
          {avgRating && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{avgRating}</span>
              <span className="text-xs text-muted-foreground font-normal">({ratings.length})</span>
            </div>
          )}
          <Button size="sm" onClick={() => setShowForm(s => !s)}
            className={cn('gap-1.5 rounded-full text-xs h-8', showForm ? 'bg-secondary text-muted-foreground' : 'bg-accent text-accent-foreground hover:bg-accent/90')}>
            {showForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add tip</>}
          </Button>
        </div>
      </div>

      {/* Add tip form */}
      {showForm && (
        <div className="rounded-2xl border border-border/40 bg-card/60 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Type of tip</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIP_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, tip_type: key }))}
                  className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all',
                    form.tip_type === key ? cfg.color : 'border-border/40 text-muted-foreground hover:border-accent/40')}>
                  <cfg.icon className="w-3 h-3" />{cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Rate {portCity} (optional)</p>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          <textarea
            placeholder={`Share a quick tip about ${portCity} — e.g. "Hagia Sophia is free after 17:00" or "Taxis outside the port are 2x the price, walk 200m instead."`}
            className="w-full h-24 rounded-xl bg-background/60 border border-border/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none focus:border-accent/50"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            maxLength={220}
          />
          <div className="flex items-center gap-3">
            <input
              placeholder="Your name (optional)"
              className="flex-1 h-9 rounded-xl bg-background/60 border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent/50"
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
            />
            <Button size="sm" disabled={!form.content.trim() || addTip.isPending}
              onClick={() => addTip.mutate({ ...form, port_city: portCity })}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 text-xs">
              Post tip
            </Button>
          </div>
        </div>
      )}

      {/* Tips list */}
      {tips.length === 0 && !showForm && (
        <div className="text-center py-8 text-sm text-muted-foreground rounded-2xl border border-border/20 bg-card/20">
          No community tips yet — be the first to share one!
        </div>
      )}
      <div className="space-y-3">
        {tips.map(tip => {
          const cfg = TIP_CONFIG[tip.tip_type] || TIP_CONFIG.tip;
          const Icon = cfg.icon;
          const timeAgo = (() => {
            const diff = Date.now() - new Date(tip.created_date).getTime();
            const hrs = Math.floor(diff / 3600000);
            if (hrs < 1) return 'just now';
            if (hrs < 24) return `${hrs}h ago`;
            return `${Math.floor(hrs / 24)}d ago`;
          })();
          return (
            <div key={tip.id} className="rounded-xl border border-border/25 bg-card/40 px-4 py-3 flex items-start gap-3">
              <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 mt-0.5', cfg.color)}>
                <Icon className="w-2.5 h-2.5" />{cfg.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 leading-relaxed">{tip.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-muted-foreground">{tip.author_name || 'Anonymous'} · {timeAgo}</span>
                  {tip.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                      {Array.from({ length: tip.rating }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400" />)}
                    </span>
                  )}
                  <button onClick={() => markHelpful.mutate({ id: tip.id, count: tip.helpful_count || 0 })}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors ml-auto">
                    <ThumbsUp className="w-3 h-3" /> {tip.helpful_count || 0} helpful
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}