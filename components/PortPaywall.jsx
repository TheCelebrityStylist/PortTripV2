import { Lock, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import UpgradeButton from '@/components/UpgradeButton';

const PREMIUM_FEATURES = [
  'Unlimited port guides — all 200+ ports',
  'Concierge-grade transport intelligence',
  'Cruise-optimised day itineraries',
  'Safety timers & return buffers',
  'AI port day planner',
];

export default function PortPaywall({ portCity, freeUsed, freeLimit, onUnlock, canUnlock, isLoading }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 shadow-xl shadow-accent/10">
        <Lock className="w-7 h-7 text-accent" />
      </div>

      {canUnlock ? (
        <>
          <h2 className="text-2xl font-black text-foreground mb-2">Unlock {portCity}</h2>
          <p className="text-muted-foreground mb-1">
            You have <span className="text-foreground font-bold">{freeLimit - freeUsed}</span> free {freeLimit - freeUsed === 1 ? 'pick' : 'picks'} remaining.
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            Once unlocked, this guide is yours permanently — no expiry.
          </p>
          <Button
            onClick={onUnlock}
            disabled={isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-black px-10 h-12 rounded-2xl shadow-xl shadow-accent/25 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Unlocking…' : `Unlock ${portCity} — Free`}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            {freeUsed}/{freeLimit} free guides used
          </p>
        </>
      ) : (
        <>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full mb-4">
            <Star className="w-3 h-3" /> Premium
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">You've unlocked your 3 free guides</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Upgrade to unlock unlimited port guides and full cruise planning.
          </p>

          <div className="w-full max-w-sm bg-card/60 border border-border/40 rounded-2xl p-6 mb-8 text-left space-y-3">
            {PREMIUM_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <UpgradeButton
              product="cruise_pass"
              label="Buy Cruise Pass — €12.99"
              className="w-full h-12 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/25"
            />
            <UpgradeButton
              product="pro_monthly"
              label="Start Pro — €14.99/mo"
              className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80"
            />
          </div>
          <Link to="/ports" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to all ports
          </Link>
        </>
      )}
    </div>
  );
}