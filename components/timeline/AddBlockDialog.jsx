import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const BLOCK_TYPES = [
  { value: 'arrival', label: 'Arrival' },
  { value: 'stop', label: 'Stop / Activity' },
  { value: 'transit', label: 'Transit' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'buffer', label: 'Buffer / Free Time' },
  { value: 'departure', label: 'Departure' },
];

const TRANSPORT_MODES = [
  { value: 'walk', label: 'Walk' },
  { value: 'drive', label: 'Drive' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'flight', label: 'Flight' },
  { value: 'ferry', label: 'Ferry' },
  { value: 'bike', label: 'Bike' },
  { value: 'taxi', label: 'Taxi' },
];

export default function AddBlockDialog({ open, onOpenChange, onSave, tripId, nextOrderIndex }) {
  const [form, setForm] = useState({
    block_type: 'stop',
    title: '',
    subtitle: '',
    location: '',
    start_time: '',
    end_time: '',
    transport_mode: '',
    notes: '',
    cost_estimate: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      trip_id: tripId,
      block_type: form.block_type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      location: form.location.trim() || undefined,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
      duration_minutes: form.start_time && form.end_time
        ? Math.round((new Date(form.end_time) - new Date(form.start_time)) / 60000)
        : undefined,
      transport_mode: form.transport_mode || undefined,
      notes: form.notes.trim() || undefined,
      cost_estimate: form.cost_estimate ? parseFloat(form.cost_estimate) : undefined,
      order_index: nextOrderIndex,
      status: 'planned',
    };
    onSave(data);
    setForm({
      block_type: 'stop', title: '', subtitle: '', location: '',
      start_time: '', end_time: '', transport_mode: '', notes: '', cost_estimate: '',
    });
    onOpenChange(false);
  };

  const isTransit = form.block_type === 'transit' || form.block_type === 'transfer';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add to journey</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={form.block_type} onValueChange={v => update('block_type', v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              className="mt-1.5"
              placeholder={isTransit ? "e.g. Train to Central Station" : "e.g. Visit the Louvre"}
              value={form.title}
              onChange={e => update('title', e.target.value)}
            />
          </div>

          {!isTransit && (
            <div>
              <Label className="text-xs text-muted-foreground">Subtitle</Label>
              <Input
                className="mt-1.5"
                placeholder="Optional description"
                value={form.subtitle}
                onChange={e => update('subtitle', e.target.value)}
              />
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input
              className="mt-1.5"
              placeholder="Address or place name"
              value={form.location}
              onChange={e => update('location', e.target.value)}
            />
          </div>

          {isTransit && (
            <div>
              <Label className="text-xs text-muted-foreground">Transport mode</Label>
              <Select value={form.transport_mode} onValueChange={v => update('transport_mode', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  {TRANSPORT_MODES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start time</Label>
              <Input
                type="datetime-local"
                className="mt-1.5"
                value={form.start_time}
                onChange={e => update('start_time', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End time</Label>
              <Input
                type="datetime-local"
                className="mt-1.5"
                value={form.end_time}
                onChange={e => update('end_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Estimated cost ($)</Label>
            <Input
              type="number"
              className="mt-1.5"
              placeholder="0.00"
              value={form.cost_estimate}
              onChange={e => update('cost_estimate', e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              className="mt-1.5 resize-none"
              rows={2}
              placeholder="Any additional details..."
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              Add to timeline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}