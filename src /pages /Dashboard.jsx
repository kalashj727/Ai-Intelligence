import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Search, FileText, Network, Clock, TrendingUp, 
  Activity, Eye, Zap, ArrowRight, Plus, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const statCards = [
  { label: 'Active Investigations', icon: Eye, value: '--', color: 'text-primary', key: 'active' },
  { label: 'Entities Tracked', icon: Network, value: '--', color: 'text-accent', key: 'entities' },
  { label: 'Reports Generated', icon: FileText, value: '--', color: 'text-chart-3', key: 'reports' },
  { label: 'Intelligence Score', icon: TrendingUp, value: '--', color: 'text-chart-4', key: 'score' },
];

export default function Dashboard() {
  const { data: investigations = [], isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => base44.entities.Investigation.list('-created_date', 10),
  });

  const activeCount = investigations.filter(i => i.status === 'active').length;
  const completedCount = investigations.filter(i => i.status === 'completed').length;

  const stats = {
    active: activeCount,
    entities: investigations.reduce((sum, i) => sum + (i.entities_analyzed?.length || 0), 0),
    reports: completedCount,
    score: investigations.length > 0 
      ? Math.round(investigations.reduce((s, i) => s + (i.confidence_score || 0), 0) / investigations.length)
      : 0,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Intelligence operations overview</p>
        </div>
        <Link to="/search">
          <Button className="bg-primary hover:bg-primary/90 font-mono text-xs tracking-wider">
            <Plus className="w-3.5 h-3.5 mr-2" />
            NEW INVESTIGATION
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass p-4 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <Activity className="w-3 h-3 text-muted-foreground/40" />
              </div>
              <div className="text-2xl font-bold font-mono">{stats[s.key]}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { to: '/search', icon: Search, label: 'Intelligence Search', desc: 'Search and analyze entities', color: 'primary' },
          { to: '/graph', icon: Network, label: 'Graph Explorer', desc: 'Explore relationship networks', color: 'accent' },
          { to: '/timeline', icon: Clock, label: 'Timeline Explorer', desc: 'Navigate event timelines', color: 'chart-3' },
        ].map((action, i) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link to={action.to}>
              <Card className="glass p-5 hover:border-primary/30 transition-all group cursor-pointer">
                <div className={`w-10 h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center mb-3`}>
                  <action.icon className={`w-5 h-5 text-${action.color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-3" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Investigations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Investigations</h2>
          <Link to="/investigations" className="text-xs text-primary font-mono hover:underline">VIEW ALL</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-3 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : investigations.length === 0 ? (
          <Card className="glass p-8 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No investigations yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start a new investigation from the search page</p>
            <Link to="/search">
              <Button variant="outline" size="sm" className="mt-4 font-mono text-xs">
                BEGIN INVESTIGATION
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {investigations.slice(0, 5).map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/investigation?id=${inv.id}`}>
                  <Card className="glass p-4 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            inv.status === 'active' ? 'bg-green-500' : 
                            inv.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground'
                          }`} />
                          <h3 className="text-sm font-medium truncate">{inv.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{inv.query}</p>
                      </div>
                      {inv.confidence_score && (
                        <div className="ml-4 text-right shrink-0">
                          <div className="text-xs font-mono text-primary">{inv.confidence_score}%</div>
                          <div className="text-[10px] text-muted-foreground">confidence</div>
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-3 transition-colors shrink-0" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
