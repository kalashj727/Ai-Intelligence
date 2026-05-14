import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Shield, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function IntelligenceReport({ report, confidenceScore }) {
  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No intelligence report available</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    toast.success('Report copied to clipboard');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground tracking-wider">CLASSIFIED INTELLIGENCE REPORT</span>
        </div>
        <div className="flex items-center gap-2">
          {confidenceScore > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-mono text-muted-foreground">CONFIDENCE</span>
              <span className="text-xs font-bold text-primary">{confidenceScore}%</span>
            </div>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopy}>
            <Copy className="w-3 h-3 mr-1" /> Copy
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="glass rounded-xl p-6">
        <ReactMarkdown
          className="prose prose-sm prose-invert max-w-none 
            prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-xl prose-h1:border-b prose-h1:border-border prose-h1:pb-3 prose-h1:mb-4
            prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
            prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-sm
            prose-li:text-muted-foreground prose-li:text-sm
            prose-strong:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
            prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:rounded
            prose-ul:my-2 prose-ol:my-2"
        >
          {report}
        </ReactMarkdown>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
        <p className="text-[10px] text-chart-4/80 font-mono leading-relaxed">
          ⚠ AI-GENERATED ANALYSIS — This report contains AI-inferred intelligence. Claims should be independently verified. 
          Confidence scores indicate the AI's self-assessed reliability. Sources and citations are AI-attributed and may require validation.
        </p>
      </div>
    </div>
  );
}
