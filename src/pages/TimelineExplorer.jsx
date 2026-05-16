import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Filter, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TimelineView from '@/components/investigation/TimelineView';

export default function TimelineExplorer() {
  const [selectedInv, setSelectedInv] = useState(null);
  const [filterSig, setFilterSig] = useState('all');

  const { data: investigations = [], isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => base44.entities.Investigation.list('-created_date', 50),
  });

  const allEvents = selectedInv
    ? (selectedInv.timeline_events || [])
    : investigations.flatMap(inv => 
        (inv.timeline_events || []).map(e => ({ ...e, investigation: inv.title, invId: inv.id }))
      );

  const filteredEvents = filterSig === 'all' 
    ? allEvents 
    : allEvents.filter(e => e.significance === filterSig);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Timeline Explorer</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Navigate events across all investigations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select value={selectedInv?.id || 'all'} onValueChange={(v) => {
          if (v === 'all') setSelectedInv(null);
          else setSelectedInv(investigations.find(i => i.id === v));
        }}>
          <SelectTrigger className="w-full sm:w-64 bg-secondary/50">
            <SelectValue placeholder="All investigations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All investigations</SelectItem>
            {investigations.map(inv => (
              <SelectItem key={inv.id} value={inv.id}>{inv.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSig} onValueChange={setFilterSig}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All significance</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-lg p-4 animate-pulse">
              <div className="h-3 bg-secondary rounded w-1/4 mb-2" />
              <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
              <div className="h-3 bg-secondary rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No timeline events found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run an intelligence search to generate timeline data</p>
          <Link to="/search">
            <Button variant="outline" size="sm" className="mt-4 font-mono text-xs">GO TO SEARCH</Button>
          </Link>
        </Card>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-[10px] font-mono">
              {filteredEvents.length} events
            </Badge>
          </div>
          <TimelineView events={filteredEvents} />
        </div>
      )}
    </div>
  );
}
