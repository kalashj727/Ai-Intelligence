import React from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle, MessageSquare, TrendingUp, Crosshair, Radio, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NarrativePanel({ narrativeAnalysis }) {
  if (!narrativeAnalysis || Object.keys(narrativeAnalysis).length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No narrative analysis available</p>
      </div>
    );
  }

  const n = narrativeAnalysis;

  const sections = [
    {
      icon: MessageSquare,
      title: 'Dominant Narratives',
      items: n.dominant_narratives || [],
      color: 'primary',
      desc: 'Primary storylines and frames detected in coverage and discourse',
    },
    {
      icon: TrendingUp,
      title: 'Media Framing Patterns',
      items: n.media_framing_patterns || n.framing_patterns || [],
      color: 'accent',
      desc: 'How media constructs and presents the subject',
    },
    {
      icon: AlertTriangle,
      title: 'Bias Indicators',
      items: n.bias_indicators || [],
      color: 'chart-4',
      desc: 'Signals of ideological slant or selective framing detected',
    },
    {
      icon: Radio,
      title: 'Propaganda Indicators',
      items: n.propaganda_indicators || [],
      color: 'destructive',
      desc: 'Coordinated messaging, emotional manipulation, or influence campaign signals',
    },
    {
      icon: Crosshair,
      title: 'Contradictions & Red Flags',
      items: n.contradictions || [],
      color: 'destructive',
      desc: 'Verifiable contradictions between claims and documented facts',
    },
    {
      icon: Eye,
      title: 'Hidden Patterns',
      items: n.hidden_patterns || [],
      color: 'accent',
      desc: 'Recurring associations or behaviors that appear across multiple unconnected events',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sentiment Overview */}
      {n.sentiment_overview && (
        <Card className="glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground tracking-wider">SENTIMENT OVERVIEW</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{n.sentiment_overview}</p>
        </Card>
      )}

      {/* Sentiment Over Time */}
      {n.sentiment_over_time?.length > 0 && (
        <Card className="glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-chart-3" />
            <span className="text-xs font-mono text-muted-foreground tracking-wider">SENTIMENT EVOLUTION</span>
          </div>
          <div className="space-y-2">
            {n.sentiment_over_time.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-chart-3 mt-2 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section, i) => (
          section.items.length > 0 && (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass p-4 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <section.icon className={`w-4 h-4 text-${section.color}`} />
                    <span className="text-xs font-semibold">{section.title}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{section.items.length}</Badge>
                </div>
                {section.desc && (
                  <p className="text-[10px] text-muted-foreground/60 mb-3 leading-relaxed">{section.desc}</p>
                )}
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div className={`w-1 h-1 rounded-full bg-${section.color} mt-2 shrink-0`} />
                      <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
