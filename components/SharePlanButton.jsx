import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Share2, Copy, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export default function SharePlanButton({ plan }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareToken = plan?.share_token;
  const shareUrl = shareToken ? `${window.location.origin}/shared/${shareToken}` : null;

  const enableShare = useMutation({
    mutationFn: () => base44.entities.PortDayPlan.update(plan.id, { share_token: generateToken() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portDayPlan'] }),
  });

  const disableShare = useMutation({
    mutationFn: () => base44.entities.PortDayPlan.update(plan.id, { share_token: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portDayPlan'] });
      setOpen(false);
    },
  });

  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {
        if (!shareToken) enableShare.mutate();
        setOpen(true);
      }}>
        <Share2 className="w-3.5 h-3.5" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-accent" /> Share your itinerary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {enableShare.isPending ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : shareUrl ? (
              <>
                <p className="text-xs text-muted-foreground">Share this link with your cruise group. They can view your itinerary and coordinate meeting times.</p>
                <div className="flex gap-2">
                  <Input className="text-xs h-9 flex-1" value={shareUrl} readOnly />
                  <Button size="sm" onClick={copy} className="h-9 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => window.open(shareUrl, '_blank')}
                  >
                    <Link className="w-3.5 h-3.5 mr-1" /> Preview link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-400 hover:text-red-400"
                    onClick={() => disableShare.mutate()}
                  >
                    Disable sharing
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}