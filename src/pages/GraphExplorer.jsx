import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Network, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RelationshipGraph from '@/components/investigation/RelationshipGraph';

export default function GraphExplorer() {
  const [selectedInvId, setSelectedInvId] = useState('all');

  const { data: investigations = [], isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => base44.entities.Investigation.list('-created_date', 50),
  });

  const selectedInv = selectedInvId === 'all' ? null : investigations.find(i => i.id === selectedInvId);

  const allRelationships = selectedInv
    ? (selectedInv.relationships || [])
    : investigations.flatMap(inv => inv.relationships || []);

  const allEntities = selectedInv
    ? (selectedInv.entities_analyzed || [])
    : investigations.flatMap(inv => inv.entities_analyzed || []);

  // Deduplicate entities by name
  const uniqueEntities = [];
  const seen = new Set();
  allEntities.forEach(e => {
    if (!seen.has(e.name)) {
      seen.add(e.name);
      uniqueEntities.push(e);
    }
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Graph Explorer</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Explore relationship networks and influence structures
          </p>
        </div>
        <Select value={selectedInvId} onValueChange={setSelectedInvId}>
          <SelectTrigger className="w-full sm:w-64 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All investigations</SelectItem>
            {investigations.map(inv => (
              <SelectItem key={inv.id} value={inv.id}>{inv.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="glass rounded-lg p-20 animate-pulse text-center">
          <div className="h-4 bg-secondary rounded w-1/3 mx-auto mb-2" />
          <div className="h-3 bg-secondary rounded w-1/4 mx-auto" />
        </div>
      ) : allRelationships.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Network className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No relationship data found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run an intelligence search to generate graph data</p>
          <Link to="/search">
            <Button variant="outline" size="sm" className="mt-4 font-mono text-xs">GO TO SEARCH</Button>
          </Link>
        </Card>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-[10px] font-mono">
              {uniqueEntities.length} nodes
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {allRelationships.length} connections
            </Badge>
          </div>
          <RelationshipGraph relationships={allRelationships} entities={uniqueEntities} />
          
          {/* Relationship table */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Connection Details</h3>
            <div className="space-y-1.5">
              {allRelationships.slice(0, 20).map((r, i) => (
                <div key={i} className="glass rounded-lg p-3 flex items-center gap-3 text-xs">
                  <span className="font-medium text-foreground">{r.source}</span>
                  <span className="text-primary font-mono">→ {r.type} →</span>
                  <span className="font-medium text-foreground">{r.target}</span>
                  {r.strength && (
                    <Badge variant="outline" className="text-[9px] ml-auto">
                      str: {r.strength}/10
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
