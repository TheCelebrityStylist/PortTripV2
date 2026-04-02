import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function TripCard({ trip, index }) {
  const startDate = trip.start_date ? format(parseISO(trip.start_date), 'MMM d') : null;
  const endDate = trip.end_date ? format(parseISO(trip.end_date), 'MMM d, yyyy') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        to={`/planner?tripId=${trip.id}`}
        className="group block p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-border/80 transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{trip.destination}</span>
            </div>
            {startDate && (
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {startDate}{endDate ? ` — ${endDate}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
              {trip.status || 'planning'}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}