import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateTripDialog({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim() || !form.destination.trim()) return;
    onSave({
      title: form.title.trim(),
      destination: form.destination.trim(),
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      status: 'planning',
    });
    setForm({ title: '', destination: '', start_date: '', end_date: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Plan a new trip</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground">Trip name</Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Paris Weekend"
              value={form.title}
              onChange={e => update('title', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Destination</Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Paris, France"
              value={form.destination}
              onChange={e => update('destination', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Input
                type="date"
                className="mt-1.5"
                value={form.start_date}
                onChange={e => update('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End date</Label>
              <Input
                type="date"
                className="mt-1.5"
                value={form.end_date}
                onChange={e => update('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.destination.trim()}>
              Create trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}