import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Calendar, Megaphone, Flag, HelpCircle, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const typeIcons = {
  person:          User,
  organization:    Building2,
  corporation:     Building2,
  event:           Calendar,
  movement:        Megaphone,
  media:           Megaphone,
  political_party: Flag,
  government_body: Flag,
  ideology:        HelpCircle,
};

const typeColors = {
  person:          'border-primary/20 hover:border-primary/40 bg-primary/5',
  organization:    'border-accent/20 hover:border-accent/40 bg-accent/5',
  corporation:     'border-accent/20 hover:border-accent/40 bg-accent/5',
  event:           'border-chart-4/20 hover:border-chart-4/40 bg-chart-4/5',
  movement:        'border-chart-3/20 hover:border-chart-3/40 bg-chart-3/5',
  media:           'border-destructive/20 hover:border-destructive/40 bg-destructive/5',
  political_party: 'border-chart-4/20 hover:border-chart-4/40 bg-chart-4/5',
  government_body: 'border-destructive/20 hover:border-destructive/40 bg-destructive/5',
};

const iconColors = {
  person:          'text-primary',
  organization:    'text-accent',
  corporation:     'text-accent',
  event:           'text-chart-4',
  movement:        'text-chart-3',
  media:           'text-destructive',
  political_party: 'text-chart-4',
  government_body: 'text-destructive',
};

function EntityCard({ entity, i }) {
  const [expanded, setExpanded] = useState(false);
  const type = (entity.type || 'unknown').toLowerCase();
  const Icon = typeIcons[type] || HelpCircle;
  const borderStyle = typeColors[type] || 'border-border hover:border-border';
  const iconStyle = iconColors[type] || 'text-muted-foreground';
  const isLong = entity.significance?.length > 120;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.04 }}
      className={`glass rounded-xl p-4 border ${borderStyle} transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className={`w-4 h-4 ${iconStyle}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold">{entity.name}</h4>
            <Badge variant="secondary" className="text-[9px] capitalize">{type.replace(/_/g, ' ')}</Badge>
          </div>

          {entity.significance && (
            <div className="mt-1.5">
              <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
                {entity.significance}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="flex items-center gap-1 text-[10px] text-primary mt-1 hover:underline"
                >
                  {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                </button>
              )}
            </div>
          )}

          {entity.credibility_tags?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <Tag className="w-2.5 h-2.5 text-muted-foreground/50" />
              {entity.credibility_tags.map((tag, j) => (
                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function EntityCards({ entities = [] }) {
  if (!entities?.length) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No entities analyzed</p>
      </div>
    );
  }

  const grouped = {};
  entities.forEach(e => {
    const t = (e.type || 'unknown').toLowerCase();
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(e);
  });

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([type, group]) => (
        <div key={type}>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2 uppercase">
            {type.replace(/_/g, ' ')} ({group.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.map((entity, i) => (
              <EntityCard key={i} entity={entity} i={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
