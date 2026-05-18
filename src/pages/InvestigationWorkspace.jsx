import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, Clock, Network, Eye, FileText, Users, 
  Shield, Loader2, Zap, CheckCircle2
} from 'lucide-react';

export default function InvestigationWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('entities');
  const [graphExpansions, setGraphExpansions] = useState(0);

  // Read from localStorage instead of base44
  const [investigation, setInvestigation] = useState(() => {
    if (!id) return null;
    const all = JSON.parse(localStorage.getItem('investigations') || '[]');
    return all.find(inv => inv.id === id) || null;
  });

  if (!id) {
    return (
      <div className="p-6 text-center pt-20">
        <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No investigation selected</p>
        <Link to="/search"><Button variant="outline" size="sm" className="mt-4 font-mono text-xs">GO TO SEARCH</Button></Link>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="p-6 text-center pt-20">
        <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Investigation not found</p>
        <Link to="/investigations"><Button variant="outline" size="sm" className="mt-4 font-mono text-xs">BACK</Button></Link>
      </div>
    );
  }

  const inv = investigation;
  const entityCount = inv.entities_analyzed?.length || 0;
  const timelineCount = inv.timeline_events?.length || 0;
  const relCount = inv.relationships?.length || 0;

  // Safe data access with defaults
  const entities = inv.entities_analyzed || [];
  const timelineEvents = inv.timeline_events || [];
  const relationships = inv.relationships || [];
  const narrativeAnalysis = inv.narrative_analysis || { main_narrative: '', contradictions: [], propaganda_signals: [] };
  const intelligenceReport = inv.intelligence_report || '';
  const confidenceScore = inv.confidence_score || 0;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <Link to="/investigations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All investigations
          </Link>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight leading-tight">{inv.title}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{inv.query}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge className={`text-[10px] ${
              inv.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'
            }`}>
              {inv.status}
            </Badge>
            {confidenceScore > 0 && (
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                {confidenceScore}% confidence
              </Badge>
            )}
            {inv.tags?.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[9px]">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {inv.summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass p-4 mb-6 border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">EXECUTIVE SUMMARY</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{inv.summary}</p>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="glass bg-secondary/30 border border-border p-1 h-auto inline-flex gap-0.5">
            <TabsTrigger value="entities" className="text-xs font-mono px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Entities
              <span className="ml-1.5 text-[9px] opacity-70">{entityCount}</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs font-mono px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Timeline
              <span className="ml-1.5 text-[9px] opacity-70">{timelineCount}</span>
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-xs font-mono px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Network className="w-3.5 h-3.5 mr-1.5" />
              Live Graph
              <span className="ml-1.5 text-[9px] opacity-70">{relCount}</span>
            </TabsTrigger>
            <TabsTrigger value="narrative" className="text-xs font-mono px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Narrative
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs font-mono px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Report
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="entities">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No entities analyzed</div>
            ) : (
              entities.map((entity, i) => (
                <Card key={i} className="glass p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{typeof entity === 'string' ? entity : entity.name || entity}</span>
                  </div>
                  {entity.description && <p className="text-xs text-muted-foreground">{entity.description}</p>}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-3">
            {timelineEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No timeline events</div>
            ) : (
              timelineEvents.map((event, i) => (
                <Card key={i} className="glass p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary">{event.date || 'N/A'}</span>
                        <Badge variant="outline" className="text-[9px]">{event.significance || 'medium'}</Badge>
                      </div>
                      <p className="text-sm">{event.event || event.title || 'Event'}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="graph">
          <div className="mb-4 flex items-start gap-3 p-3 glass rounded-lg border border-primary/10">
            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">Relationship Graph</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {relationships.length} connections mapped between entities.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {relationships.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No relationships mapped</div>
            ) : (
              relationships.map((rel, i) => (
                <Card key={i} className="glass p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{rel.source}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{rel.target}</span>
                    <Badge variant="outline" className="text-[9px] ml-2">{rel.type}</Badge>
                  </div>
                  {rel.evidence && <p className="text-xs text-muted-foreground mt-1">{rel.evidence}</p>}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="narrative">
          <Card className="glass p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Main Narrative</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{narrativeAnalysis.main_narrative || 'No narrative analysis available'}</p>
            </div>
            {narrativeAnalysis.contradictions?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-amber-400">Contradictions</h3>
                <ul className="space-y-1">
                  {narrativeAnalysis.contradictions.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            )}
            {narrativeAnalysis.propaganda_signals?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-red-400">Propaganda Signals</h3>
                <ul className="space-y-1">
                  {narrativeAnalysis.propaganda_signals.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card className="glass p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">INTELLIGENCE REPORT</span>
              {confidenceScore > 0 && (
                <Badge variant="outline" className="text-[10px] font-mono ml-auto">{confidenceScore}% confidence</Badge>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{intelligenceReport || 'No report generated'}</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
