import { ArrowLeft, Share2, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PlannerHeader({ trip, blockCount, onAddBlock, onAiSuggest }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-secondary-foreground" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              {trip?.title || 'Untitled Trip'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trip?.destination || 'No destination'} · {blockCount} {blockCount === 1 ? 'stop' : 'stops'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={onAiSuggest}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI suggest
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onAddBlock}
          >
            <Plus className="w-3.5 h-3.5" />
            Add stop
          </Button>
        </div>
      </div>
    </header>
  );
}