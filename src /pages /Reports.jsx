import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Shield, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Reports() {
  const { data: investigations = [], isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => base44.entities.Investigation.list('-created_date', 50),
  });

  const withReports = investigations.filter(inv => inv.intelligence_report);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Reports</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {withReports.length} generated reports
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-lg p-5 animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : withReports.length === 0 ? (
        <Card className="glass p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reports generated yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run an intelligence search to generate a report</p>
          <Link to="/search">
            <Button variant="outline" size="sm" className="mt-4 font-mono text-xs">GO TO SEARCH</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {withReports.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/investigation?id=${inv.id}`}>
                <Card className="glass p-4 hover:border-primary/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {inv.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{inv.summary}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {inv.confidence_score > 0 && (
                          <span className="text-[10px] font-mono text-primary">{inv.confidence_score}% confidence</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {inv.intelligence_report?.length || 0} chars
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
