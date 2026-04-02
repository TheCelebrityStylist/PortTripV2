import { useState } from 'react';
import { TrendingDown, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function BudgetIntelligence({ shipExcursionPrice, diyBudget, onUpdate, currency = '€', className }) {
  const [shipPrice, setShipPrice] = useState(shipExcursionPrice || '');
  const [diyPrice, setDiyPrice] = useState(diyBudget || '');

  const savings = shipPrice && diyPrice ? parseFloat(shipPrice) - parseFloat(diyPrice) : null;
  const savingsPct = savings && shipPrice ? Math.round((savings / parseFloat(shipPrice)) * 100) : null;

  const handleChange = (field, val) => {
    if (field === 'ship') {
      setShipPrice(val);
      onUpdate?.({ shipExcursionPrice: parseFloat(val) || 0, diyBudget: parseFloat(diyPrice) || 0 });
    } else {
      setDiyPrice(val);
      onUpdate?.({ shipExcursionPrice: parseFloat(shipPrice) || 0, diyBudget: parseFloat(val) || 0 });
    }
  };

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-4 h-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Budget Intelligence Mode
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground">Ship tour</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currency}</span>
            <Input
              type="number"
              className="pl-7 bg-secondary/50"
              placeholder="119"
              value={shipPrice}
              onChange={e => handleChange('ship', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">DIY route</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currency}</span>
            <Input
              type="number"
              className="pl-7 bg-secondary/50"
              placeholder="32"
              value={diyPrice}
              onChange={e => handleChange('diy', e.target.value)}
            />
          </div>
        </div>
      </div>

      {savings !== null && savings > 0 && (
        <div className="rounded-lg bg-green-400/10 border border-green-400/20 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-400/70 uppercase tracking-wide font-medium">You save</p>
            <p className="text-2xl font-bold text-green-400">{currency}{savings.toFixed(0)}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-green-400">{savingsPct}% cheaper</span>
            <p className="text-xs text-muted-foreground">going DIY</p>
          </div>
        </div>
      )}

      {savings !== null && savings <= 0 && (
        <div className="rounded-lg bg-yellow-400/10 border border-yellow-400/20 p-3">
          <p className="text-xs text-yellow-400 font-medium">Ship tour may be worth it for this port</p>
        </div>
      )}
    </div>
  );
}