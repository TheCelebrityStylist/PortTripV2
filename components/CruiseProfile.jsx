import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ship, User, BookOpen, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CRUISE_LINES = [
  'Royal Caribbean', 'Carnival', 'Norwegian (NCL)', 'MSC Cruises',
  'Celebrity Cruises', 'Holland America', 'Princess Cruises', 'Costa Cruises',
  'AIDA', 'TUI Cruises', 'Cunard', 'Regent Seven Seas', 'Silversea', 'Other',
];

export default function CruiseProfile({ onSave }) {
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState(null);

  // Init form from user data once loaded
  if (userData && !form) {
    setForm({
      cruise_line: userData.cruise_line || '',
      ship_name: userData.ship_name || '',
      booking_reference: userData.booking_reference || '',
    });
  }

  const save = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Cruise profile saved');
      onSave?.();
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      </div>
    );
  }

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cruise Line</Label>
        <select
          value={form.cruise_line}
          onChange={e => up('cruise_line', e.target.value)}
          className="mt-2 w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Select cruise line…</option>
          {CRUISE_LINES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ship Name</Label>
        <div className="relative mt-2">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 bg-background/60 border-border/60 rounded-xl"
            placeholder="e.g. Symphony of the Seas"
            value={form.ship_name}
            onChange={e => up('ship_name', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Booking Reference</Label>
        <div className="relative mt-2">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 bg-background/60 border-border/60 rounded-xl"
            placeholder="e.g. RC1234567"
            value={form.booking_reference}
            onChange={e => up('booking_reference', e.target.value)}
          />
        </div>
      </div>

      {(form.cruise_line || form.ship_name) && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your cruise profile pre-fills ship-specific context in AI itineraries — including excursion pricing typical for <strong className="text-foreground">{form.cruise_line || form.ship_name}</strong> passengers.
          </p>
        </div>
      )}

      <Button
        onClick={() => save.mutate(form)}
        disabled={save.isPending}
        className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold gap-2"
      >
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save cruise profile
      </Button>
    </div>
  );
}