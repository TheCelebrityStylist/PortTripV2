import { motion } from 'framer-motion';
import { Shield, Clock, Star, TrendingDown, Footprints, Route, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getPlanBadges } from '../utils/scoringEngine';

const SUB_SCORES = [
  { key: 'cruiseSafety',     label: 'Cruise Safety',    icon: Shield,      weight: '25%', color: 'bg-green-400' },
  { key: 'sightseeingValue', label: 'Sightseeing Value', icon: Star,       weight: '25%', color: 'bg-purple-400' },
  { key: 'timeEfficiency',   label: 'Time Efficiency',  icon: Clock,       weight: '20%', color: 'bg-cyan-400' },
  { key: 'costEfficiency',   label: 'Cost Efficiency',  icon: TrendingDown,weight: '10%', color: 'bg-blue-400' },
  { key: 'walkingComfort',   label: 'Walking Comfort',  icon: Footprints,  weight: '10%', color: 'bg-orange-400' },
  { key: 'routeLogic',       label: 'Route Logic',      icon: Route,       weight: '10%', color: 'bg-pink-400' },
];

const BADGE_COLORS = {
  green:  'text-green-400 bg-green-400/10 border-green-400/20',
  cyan:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  blue:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  accent: 'text-accent bg-accent/10 border-accent/20',
};

function ScoreRing({ score, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#facc15' : '#f87171';

  return (
    <svg width={size} height={size} className="flex-shrink-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="6" fill="none" className="text-border/30" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth="6" fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - fill }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function ScoreBar({ score, colorClass, delay = 0 }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function PlanScoreCard({ planScore, scoreBreakdown, scoreExplanation, optimizationMode }) {
  const [expanded, setExpanded] = useState(false);
  if (!planScore || !scoreBreakdown) return null;

  const badges = getPlanBadges(scoreBreakdown, planScore);
  const scoreColor = planScore >= 80 ? 'text-green-400' : planScore >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/70 overflow-hidden"
    >
      {/* Top row */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative flex-shrink-0">
          <ScoreRing score={planScore} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn('text-lg font-black leading-none tabular-nums', scoreColor)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {planScore}
            </motion.span>
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wide">score</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="text-xs font-black text-foreground">Plan Score</p>
            {optimizationMode && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold border border-accent/20">
                {optimizationMode}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {badges.map(b => (
              <span key={b.label} className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', BADGE_COLORS[b.color])}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Sub-scores */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4 space-y-2.5 border-t border-border/20 pt-3"
        >
          {SUB_SCORES.map(({ key, label, icon: Icon, weight, color }, i) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                  <span className="text-[9px] text-muted-foreground/40">{weight}</span>
                </div>
                <span className={cn('text-[10px] font-black tabular-nums',
                  scoreBreakdown[key] >= 80 ? 'text-green-400' : scoreBreakdown[key] >= 60 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {scoreBreakdown[key]}
                </span>
              </div>
              <ScoreBar score={scoreBreakdown[key]} colorClass={color} delay={i * 0.08} />
            </div>
          ))}

          {/* Explanation */}
          {scoreExplanation && (
            <div className="mt-3 space-y-2 pt-3 border-t border-border/15">
              {scoreExplanation.strengths?.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-400 mb-1">Strengths</p>
                  {scoreExplanation.strengths.map((s, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground leading-snug flex items-start gap-1">
                      <span className="text-green-400 mt-0.5">✓</span> {s}
                    </p>
                  ))}
                </div>
              )}
              {scoreExplanation.weaknesses?.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-1">Improve</p>
                  {scoreExplanation.weaknesses.map((w, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground leading-snug flex items-start gap-1">
                      <span className="text-yellow-400 mt-0.5">↑</span> {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}