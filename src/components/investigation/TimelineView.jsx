import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, ChevronRight, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const significanceColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-chart-4/10 text-chart-4',
  critical: 'bg-destructive/10 text-destructive',
};

const significanceDots = {
  low: 'bg-muted-foreground',
  medium: 'bg-primary',
  high: 'bg-chart-4',
  critical: 'bg-destructive',
};

export default function TimelineView({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No timeline events available</p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return da - db;
  });

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {sorted.map((event, i) => {
          const sig = event.significance || 'medium';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-10"
            >
              {/* Dot */}
              <div className={`absolute left-[11px] top-4 w-2.5 h-2.5 rounded-full ${significanceDots[sig]} ring-4 ring-background`} />

              <Card className="glass p-4 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground mb-1">{event.date}</div>
                    <h4 className="text-sm font-semibold">{event.title}</h4>
                  </div>
                  <Badge className={`${significanceColors[sig]} text-[10px] shrink-0`}>
                    {sig}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

                {event.linked_entities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {event.linked_entities.map((e, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {e}
                      </span>
                    ))}
                  </div>
                )}

                {event.sources?.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50">{event.sources.length} source(s)</span>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
