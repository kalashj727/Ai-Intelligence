import React from 'react';
import { Settings, Shield, Zap, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AppSettings() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Platform configuration</p>
      </div>

      <div className="space-y-4">
        <Card className="glass p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Platform Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground">AI Engine</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-mono">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground">Database</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-mono">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Web Search</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-mono">Active</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass p-5">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold">About</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>NEXUS Intelligence Platform v1.0</p>
            <p>AI-powered investigative intelligence analysis with OSINT capabilities.</p>
            <p className="text-[10px] mt-3 text-muted-foreground/50 font-mono">
              Powered by advanced AI models with web search augmentation. 
              All analysis is AI-generated and should be independently verified.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
