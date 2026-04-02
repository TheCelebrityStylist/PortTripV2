import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, Crown, Ship, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PRODUCT_CONFIG = {
  cruise_pass:      { label: 'Buy Cruise Pass — €12.99', icon: Ship,    product: 'cruise_pass' },
  pro_monthly:      { label: 'Start Pro — €14.99/mo',    icon: Sparkles, product: 'pro_monthly' },
  pro_yearly:       { label: 'Start Pro — €9.99/mo',     icon: Sparkles, product: 'pro_yearly' },
  ultimate_monthly: { label: 'Start Ultimate — €24.99/mo', icon: Crown,  product: 'ultimate_monthly' },
  ultimate_yearly:  { label: 'Start Ultimate — €16.99/mo', icon: Crown,  product: 'ultimate_yearly' },
};

export default function UpgradeButton({ product = 'pro_monthly', className, label, size = 'default' }) {
  const [loading, setLoading] = useState(false);
  const cfg = PRODUCT_CONFIG[product] || PRODUCT_CONFIG.pro_monthly;
  const Icon = cfg.icon;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('stripeCheckout', {
        product: cfg.product,
        success_url: window.location.origin + '/dashboard?upgraded=1',
        cancel_url: window.location.href,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not start checkout');
      }
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      size={size}
      className={cn('gap-2 font-bold', className)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label || cfg.label}
    </Button>
  );
}