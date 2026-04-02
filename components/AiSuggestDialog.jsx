import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AiSuggestDialog({ open, onOpenChange, trip, existingBlocks, onAccept }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSuggestions(null);

    const existingSummary = existingBlocks.map(b =>
      `${b.block_type}: ${b.title}${b.start_time ? ` at ${b.start_time}` : ''}`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a travel planner assistant. The user is planning a trip to ${trip?.destination || 'a destination'} called "${trip?.title || 'Trip'}".

Existing itinerary:
${existingSummary || 'Empty - no stops yet.'}

User request: ${prompt}

Generate 3-5 suggested stops/activities. For each, provide:
- block_type: one of "arrival", "stop", "transit", "transfer", "buffer", "departure"
- title: name of stop/activity
- subtitle: brief description
- location: address or area
- duration_minutes: estimated time
- transport_mode: if transit, one of "walk","drive","train","bus","flight","ferry","bike","taxi"
- cost_estimate: rough cost in USD`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                block_type: { type: "string" },
                title: { type: "string" },
                subtitle: { type: "string" },
                location: { type: "string" },
                duration_minutes: { type: "number" },
                transport_mode: { type: "string" },
                cost_estimate: { type: "number" },
              }
            }
          }
        }
      }
    });

    setSuggestions(result.suggestions || []);
    setLoading(false);
  };

  const handleAccept = (suggestion) => {
    onAccept(suggestion);
  };

  const handleAcceptAll = () => {
    if (suggestions) {
      suggestions.forEach(s => onAccept(s));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-accent" />
            AI Journey Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Textarea
            rows={3}
            placeholder="Describe what you'd like... e.g. 'Add a morning at museums and lunch in the Latin Quarter'"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="resize-none"
          />

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate suggestions'}
          </Button>

          {suggestions && suggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {suggestions.length} suggestions
                </span>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleAcceptAll}>
                  Add all
                </Button>
              </div>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
                    {s.duration_minutes && (
                      <span className="text-xs text-muted-foreground/60">{s.duration_minutes}m</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => handleAccept(s)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}