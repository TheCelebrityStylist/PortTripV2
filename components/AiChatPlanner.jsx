import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, Plus, Check, Bot, User, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STARTERS = [
  'What are the top 5 things I must do here?',
  'Build me a full day itinerary',
  'Best local food spots near the port',
  'Relaxed morning, culture in the afternoon',
  'Family-friendly plan with no long walks',
  'How do I save the most money today?',
];

function MessageBubble({ msg, onAcceptItinerary, acceptedStops }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}
    >
      {msg.role === 'assistant' && (
        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
      )}
      <div className={cn("max-w-[85%] space-y-3", msg.role === 'user' && "flex flex-col items-end")}>
        {msg.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            msg.role === 'user'
              ? "bg-accent text-accent-foreground rounded-tr-sm font-medium"
              : "bg-card border border-border/50 text-foreground rounded-tl-sm"
          )}>
            {msg.content}
          </div>
        )}

        {/* Itinerary stops */}
        {msg.itinerary?.stops?.length > 0 && (
          <div className="space-y-2 w-full">
            <p className="text-xs text-muted-foreground font-semibold px-1">
              ✨ AI generated {msg.itinerary.stops.length} stops — add them to your timeline:
            </p>
            {msg.itinerary.stops.map((s, idx) => {
              const key = `${msg.id}-${idx}`;
              const isAdded = acceptedStops.has(key);
              return (
                <div key={idx} className={cn(
                  "rounded-xl border p-3 flex items-start justify-between gap-3 transition-all",
                  isAdded ? "border-green-400/30 bg-green-400/5" : "border-border/40 bg-card/70 hover:border-accent/30"
                )}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{s.title}</span>
                      {s.duration_minutes > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {s.duration_minutes}m
                        </span>
                      )}
                    </div>
                    {s.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</p>}
                    {s.cost_estimate > 0 && (
                      <span className="text-xs text-muted-foreground/60">€{s.cost_estimate}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isAdded ? "ghost" : "outline"}
                    onClick={() => !isAdded && onAcceptItinerary(s, key)}
                    className={cn(
                      "h-7 text-xs gap-1 rounded-lg flex-shrink-0",
                      isAdded && "text-green-400"
                    )}
                  >
                    {isAdded ? <><Check className="w-3 h-3" />Added</> : <><Plus className="w-3 h-3" />Add</>}
                  </Button>
                </div>
              );
            })}
            {msg.itinerary.stops.length > 1 && (
              <Button
                size="sm"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 rounded-xl font-bold"
                onClick={() => onAcceptItinerary(msg.itinerary.stops, null, true)}
              >
                <Plus className="w-3.5 h-3.5" /> Add all {msg.itinerary.stops.length} stops to timeline
              </Button>
            )}
          </div>
        )}
      </div>
      {msg.role === 'user' && (
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

export default function AiChatPlanner({ plan, onAcceptStop }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedStops, setAcceptedStops] = useState(new Set());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgId = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Greeting on mount
  useEffect(() => {
    if (plan?.port_city) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hey! I'm your PortTrip AI 🌊 I've got your ${plan.port_city} day covered.\n\nYou have until **${plan.all_aboard_time}** all-aboard${plan.tender_delay_minutes > 0 ? ` (plus ${plan.tender_delay_minutes}min tender)` : ''}. That gives us plenty of time to build you something incredible.\n\nWhat kind of day are you looking for?`,
      }]);
    }
  }, [plan?.port_city]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { id: `u${msgId.current++}`, role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const historyForApi = newMessages.map(m => ({ role: m.role, content: m.content }));

    const result = await base44.functions.invoke('portChat', {
      mode: 'chat',
      messages: historyForApi,
      plan,
    });

    const assistantMsg = {
      id: `a${msgId.current++}`,
      role: 'assistant',
      content: result?.data?.content || 'Sorry, something went wrong. Try again.',
      itinerary: result?.data?.itinerary,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleAccept = (stopOrStops, key, bulk = false) => {
    if (bulk) {
      stopOrStops.forEach((s, i) => {
        onAcceptStop(s);
        setAcceptedStops(prev => new Set([...prev, `bulk-${i}`]));
      });
      toast.success(`✅ ${stopOrStops.length} stops added to timeline`);
    } else {
      onAcceptStop(stopOrStops);
      setAcceptedStops(prev => new Set([...prev, key]));
      toast.success(`"${stopOrStops.title}" added`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
        {messages.length === 0 && !plan?.port_city && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground mb-1">Your AI cruise planner</p>
              <p className="text-sm text-muted-foreground max-w-sm">Set up your port day first (use Settings), then I'll build you a personalised itinerary.</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onAcceptItinerary={handleAccept}
              acceptedStops={acceptedStops}
            />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 0.15, 0.3].map(d => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && plan?.port_city && (
        <div className="flex flex-wrap gap-2 pb-3">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/60 text-muted-foreground hover:border-accent/40 hover:text-foreground hover:bg-accent/5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="pt-3 border-t border-border/40">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="flex-1 h-11 rounded-xl border border-border/50 bg-card/60 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
            placeholder={plan?.port_city ? `Ask anything about ${plan.port_city}…` : 'Set up your port day first…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={!plan?.port_city}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || !plan?.port_city}
            className="h-11 w-11 p-0 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}