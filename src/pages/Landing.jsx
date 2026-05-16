import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Search, Network, Clock, FileText, Zap, ArrowRight, Eye, Brain, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Search, title: 'Deep Intelligence Search', desc: 'Semantic search across people, organizations, events, and narratives with AI-powered analysis.' },
  { icon: Network, title: 'Relationship Mapping', desc: 'Dynamic force-directed graphs revealing hidden connections and influence networks.' },
  { icon: Clock, title: 'Timeline Reconstruction', desc: 'AI-reconstructed chronological intelligence with event significance scoring.' },
  { icon: Brain, title: 'Multi-Agent AI Analysis', desc: 'Specialized AI agents for OSINT, narrative analysis, and behavioral pattern detection.' },
  { icon: Eye, title: 'Narrative Intelligence', desc: 'Media framing analysis, propaganda detection, and coordinated messaging identification.' },
  { icon: FileText, title: 'Intelligence Reports', desc: 'Auto-generated dossiers with citations, confidence scores, and actionable insights.' },
];

function ParticleField() {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Uncover hidden connections. Analyze narratives. Map influence.';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleField />
      <div className="grid-pattern absolute inset-0 opacity-30" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-base font-bold tracking-wider text-foreground">NEXUS</span>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest block -mt-0.5">INTELLIGENCE</span>
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs tracking-wider">
            ENTER PLATFORM <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 lg:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono text-primary tracking-wider">AI-POWERED OSINT PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
            <span className="text-foreground">Next-Gen </span>
            <span className="text-primary text-glow">Investigative</span>
            <br />
            <span className="text-foreground">Intelligence</span>
          </h1>

          <div className="mt-6 h-8">
            <p className="text-lg text-muted-foreground font-mono">
              {typedText}
              <span className="animate-pulse text-primary">|</span>
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/search">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono tracking-wider px-8 glow-primary">
                <Search className="w-4 h-4 mr-2" />
                START INVESTIGATING
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary font-mono tracking-wider px-8">
                <Globe className="w-4 h-4 mr-2" />
                VIEW DASHBOARD
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-300 group cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <div className="mt-24 text-center">
          <p className="text-xs font-mono text-muted-foreground/50 tracking-widest">
            INTELLIGENCE · ANALYSIS · TRUTH
          </p>
        </div>
      </div>
    </div>
  );
}
