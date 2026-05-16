import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
import DeepTimeline from '@/components/investigation/DeepTimeline';
import LiveRelationshipGraph from '@/components/investigation/LiveRelationshipGraph';
import NarrativePanel from '@/components/investigation/NarrativePanel';
import EntityCards from '@/components/investigation/EntityCards';
import IntelligenceReport from '@/components/investigation/IntelligenceReport';

export default function InvestigationWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('entities');
  const [graphExpansions, setGraphExpansions] = useState(0);
  const [expansionNotice, setExpansionNotice] = useState(null);

  const { data: investigation, isLoading } = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => base44.entities.Investigation.filter({ id }),
    enabled: !!id,
    select: (data) => data?.[0],
  });

  // When the graph discovers new nodes/edges/events, merge them into the saved investigation
  const handleGraphExpanded = useCallback(async (expansion) => {
    if (!investigation) return;

    const existingEntities = investigation.entities_analyzed || [];
    const existingRels = investigation.relationships || [];
    const existingEvents = investigation.timeline_events || [];

    const newEntities = (expansion.new_entities || []).filter(
      e => !existingEntities.find(x => x.name === e.name)
    );
    const newRels = (expansion.new_relationships || []).filter(
      r => !existingRels.find(x => (x.source === r.source && x.target === r.target) || (x.source === r.target && x.target === r.source))
    );
    const newEvents = (expansion.new_timeline_events || []).filter(
      e => !existingEvents.find(x => x.title === e.title)
    );

    if (newEntities.length === 0 && newRels.length === 0 && newEvents.length === 0) return;

    await base44.entities.Investigation.update(investigation.id, {
      entities_analyzed: [...existingEntities, ...newEntities],
      relationships: [...existingRels, ...newRels],
      timeline_events: [...existingEvents, ...newEvents],
    });

    setGraphExpansions(n => n + 1);
    setExpansionNotice({
      entities: newEntities.length,
      relations: newRels.length,
      events: newEvents.length,
    });
    setTimeout(() => setExpansionNotice(null), 4000);

    queryClient.invalidateQueries({ queryKey: ['investigation', id] });
  }, [investigation, id, queryClient]);

  if (!id) {
    return (
      <div className="p-6 text-center pt-20">
        <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No investigation selected</p>
        <Link to="/search"><Button variant="outline" size="sm" className="mt-4 font-mono text-xs">GO TO SEARCH</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs font-mono text-muted-foreground">Loading investigation...</span>
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
  const subEventCount = (inv.timeline_events || []).reduce((s, e) => s + (e.sub_events?.length || 0), 0);
  const relCount = inv.relationships?.length || 0;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Expansion success notice */}
      <AnimatePresence>
        {expansionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 glass-strong rounded-xl p-4 border border-green-500/20 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-400">Graph Expanded</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  +{expansionNotice.entities} entities · +{expansionNotice.relations} connections · +{expansionNotice.events} events added
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {inv.confidence_score > 0 && (
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                {inv.confidence_score}% confidence
              </Badge>
            )}
            {graphExpansions > 0 && (
              <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                <Zap className="w-2.5 h-2.5 mr-1" /> {graphExpansions} expansion{graphExpansions !== 1 ? 's' : ''}
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
              <span className="ml-1.5 text-[9px] opacity-70">{timelineCount}{subEventCount > 0 ? `+${subEventCount}` : ''}</span>
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
          <EntityCards entities={inv.entities_analyzed} />
        </TabsContent>

        <TabsContent value="timeline">
          <DeepTimeline events={inv.timeline_events} />
        </TabsContent>

        <TabsContent value="graph">
          <div className="mb-4 flex items-start gap-3 p-3 glass rounded-lg border border-primary/10">
            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">Live Intelligence Graph</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click any node to inspect it. Use "Expand Intelligence" to trigger a new AI investigation around that entity — new nodes, connections, and timeline events will be discovered and merged into this investigation in real time.
              </p>
            </div>
          </div>
          <LiveRelationshipGraph
            relationships={inv.relationships}
            entities={inv.entities_analyzed}
            investigationQuery={inv.query}
            onGraphExpanded={handleGraphExpanded}
          />
        </TabsContent>

        <TabsContent value="narrative">
          <NarrativePanel narrativeAnalysis={inv.narrative_analysis} />
        </TabsContent>

        <TabsContent value="report">
          <IntelligenceReport report={inv.intelligence_report} confidenceScore={inv.confidence_score} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
