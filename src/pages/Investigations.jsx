import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bookmark, Search, ArrowRight, Trash2, Clock, 
  Shield, Plus, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function Investigations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Read from localStorage instead of base44
  const [investigations, setInvestigations] = useState(() => {
    return JSON.parse(localStorage.getItem('investigations') || '[]');
  });

  const deleteInvestigation = (id) => {
    const updated = investigations.filter(inv => inv.id !== id);
    localStorage.setItem('investigations', JSON.stringify(updated));
    setInvestigations(updated);
  };

  const filtered = investigations.filter(inv => {
    const matchesSearch = !searchTerm || 
      inv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.query?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investigations</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{investigations.length} total investigations</p>
        </div>
        <Link to="/search">
          <Button className="bg-primary hover:bg-primary/90 font-mono text-xs tracking-wider">
            <Plus className="w-3.5 h-3.5 mr-2" /> NEW INVESTIGATION
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'active', 'completed', 'archived'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              className="text-xs font-mono capitalize"
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Bookmark className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'No matching investigations found' : 'No investigations yet'}
          </p>
          <Link to="/search">
            <Button variant="outline" size="sm" className="mt-4 font-mono text-xs">START INVESTIGATING</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="glass p-4 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <Link to={`/investigation?id=${inv.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        inv.status === 'active' ? 'bg-green-500' :
                        inv.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {inv.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">{inv.query}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {inv.confidence_score > 0 && (
                        <span className="text-[10px] font-mono text-primary">{inv.confidence_score}% conf.</span>
                      )}
                      {inv.entities_analyzed?.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {inv.entities_analyzed.length} entities
                        </span>
                      )}
                      {inv.timeline_events?.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {inv.timeline_events.length} events
                        </span>
                      )}
                      {inv.tags?.slice(0, 3).map((tag, j) => (
                        <Badge key={j} variant="secondary" className="text-[9px]">{tag}</Badge>
                      ))}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Investigation</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this investigation and all its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteInvestigation(inv.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Link to={`/investigation?id=${inv.id}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
