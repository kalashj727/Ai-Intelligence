import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChevronDown, ChevronRight, ExternalLink, 
  Shield, AlertTriangle, Info, CheckCircle2, HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ─── Significance Config ──────────────────────────────────────────────────────
const SIG = {
  critical: { dot: 'bg-destructive', line: 'border-destructive/40', badge: 'bg-destructive/10 text-destructive border-destructive/20', label: 'CRITICAL' },
  high:     { dot: 'bg-chart-4',     line: 'border-chart-4/40',     badge: 'bg-chart-4/10 text-chart-4 border-chart-4/20',     label: 'HIGH' },
  medium:   { dot: 'bg-primary',     line: 'border-primary/40',     badge: 'bg-primary/10 text-primary border-primary/20',     label: 'MEDIUM' },
  low:      { dot: 'bg-muted-foreground', line: 'border-border',   badge: 'bg-muted text-muted-foreground border-border',     label: 'LOW' },
};

// ─── Evidence Badge ───────────────────────────────────────────────────────────
function EvidenceBadge({ type }) {
  const config = {
    verified: { icon: CheckCircle2, cls: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'VERIFIED' },
    reported: { icon: Info,         cls: 'text-primary bg-primary/10 border-primary/20',       label: 'REPORTED' },
    alleged:  { icon: AlertTriangle,cls: 'text-chart-4 bg-chart-4/10 border-chart-4/20',       label: 'ALLEGED' },
    inferred: { icon: HelpCircle,   cls: 'text-muted-foreground bg-muted border-border',        label: 'INFERRED' },
  }[type] || { icon: Info, cls: 'text-muted-foreground bg-muted border-border', label: type?.toUpperCase() || '?' };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${config.cls}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

// ─── Sub-Event ────────────────────────────────────────────────────────────────
function SubEvent({ event, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      className="flex items-start gap-3 pl-4 border-l border-border/50 ml-3 py-2"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0 -ml-[4.5px]" />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground/60">{event.date}</span>
          {event.evidence_type && <EvidenceBadge type={event.evidence_type} />}
        </div>
        <p className="text-xs font-medium text-foreground mt-0.5">{event.title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{event.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Phase Event ──────────────────────────────────────────────────────────────
function PhaseEvent({ event, index, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const sig = SIG[event.significance] || SIG.medium;
  const hasSubEvents = event.sub_events?.length > 0;

  return (
    <div className={`relative pl-10 pb-5 ${!isLast ? 'border-l-2 ml-[15px] ' + sig.line : 'ml-[15px]'}`}>
      {/* Phase dot */}
      <div className={`absolute left-[-6px] top-4 w-3 h-3 rounded-full ${sig.dot} ring-4 ring-background shadow-lg`} />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`glass rounded-xl p-4 transition-all duration-200 ${hasSubEvents ? 'cursor-pointer hover:border-primary/20' : ''}`}
        onClick={hasSubEvents ? () => setExpanded(e => !e) : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono text-muted-foreground">{event.date}</span>
              {event.phase && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {event.phase}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-foreground leading-tight">{event.title}</h4>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-[9px] ${sig.badge}`}>{sig.label}</Badge>
            {hasSubEvents && (
              <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{event.description}</p>

        {/* Footer */}
        <div className="flex items-center flex-wrap gap-2 mt-2">
          {event.evidence_type && <EvidenceBadge type={event.evidence_type} />}
          {event.linked_entities?.slice(0, 4).map((e, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{e}</span>
          ))}
          {event.linked_entities?.length > 4 && (
            <span className="text-[9px] text-muted-foreground">+{event.linked_entities.length - 4} more</span>
          )}
          {event.sources?.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50" />
              <span className="text-[9px] text-muted-foreground/50">{event.sources.length} source{event.sources.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Sub-events */}
        <AnimatePresence>
          {expanded && hasSubEvents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-0 overflow-hidden"
            >
              {event.sub_events.map((sub, i) => (
                <SubEvent key={i} event={sub} i={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Phase Group ──────────────────────────────────────────────────────────────
function PhaseGroup({ phase, events }) {
  const [collapsed, setCollapsed] = useState(false);
  const criticalCount = events.filter(e => e.significance === 'critical').length;
  const highCount = events.filter(e => e.significance === 'high').length;

  return (
    <div className="mb-6">
      <button
        className="flex items-center gap-3 mb-3 w-full text-left group"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[10px] font-mono tracking-widest text-primary uppercase">{phase}</span>
          <div className="flex-1 h-px bg-border/50" />
          <div className="flex gap-1.5">
            {criticalCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-mono">{criticalCount} critical</span>
            )}
            {highCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-chart-4/10 text-chart-4 font-mono">{highCount} high</span>
            )}
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">{events.length} events</span>
          </div>
        </div>
        <motion.div animate={{ rotate: collapsed ? -90 : 0 }}>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {events.map((event, i) => (
              <PhaseEvent key={i} event={event} index={i} isLast={i === events.length - 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeepTimeline({ events = [] }) {
  const [filter, setFilter] = useState('all');

  if (!events?.length) {
    return (
      <div className="text-center py-12">
        <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No timeline events available</p>
      </div>
    );
  }

  // Group by phase
  const phaseMap = new Map();
  const sortedEvents = [...events].sort((a, b) => {
    const da = new Date(a.date), db = new Date(b.date);
    if (isNaN(da) && isNaN(db)) return 0;
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return da - db;
  });

  sortedEvents.forEach(ev => {
    const phase = ev.phase || 'General Events';
    if (!phaseMap.has(phase)) phaseMap.set(phase, []);
    phaseMap.get(phase).push(ev);
  });

  const filtered = filter === 'all' 
    ? sortedEvents 
    : sortedEvents.filter(e => e.significance === filter);

  const phaseMapFiltered = new Map();
  filtered.forEach(ev => {
    const phase = ev.phase || 'General Events';
    if (!phaseMapFiltered.has(phase)) phaseMapFiltered.set(phase, []);
    phaseMapFiltered.get(phase).push(ev);
  });

  const totalSubEvents = events.reduce((s, e) => s + (e.sub_events?.length || 0), 0);

  return (
    <div>
      {/* Stats & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">{events.length}</span> phases ·{' '}
            <span className="text-foreground font-semibold">{totalSubEvents}</span> sub-events ·{' '}
            <span className="text-foreground font-semibold">{phaseMap.size}</span> chapters
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'critical', 'high', 'medium'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all ${
                filter === f 
                  ? f === 'all' ? 'bg-primary text-primary-foreground' :
                    f === 'critical' ? 'bg-destructive text-destructive-foreground' :
                    f === 'high' ? 'bg-chart-4/20 text-chart-4' : 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Legend */}
      <div className="flex gap-4 mb-5 flex-wrap">
        {['verified', 'reported', 'alleged', 'inferred'].map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <EvidenceBadge type={t} />
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground/50 font-mono ml-2">↓ Click phase events to expand sub-events</span>
      </div>

      {/* Timeline */}
      {Array.from(phaseMapFiltered.entries()).map(([phase, evs]) => (
        <PhaseGroup key={phase} phase={phase} events={evs} />
      ))}
    </div>
  );
}
