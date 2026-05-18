import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Zap, ArrowRight, Loader2, Sparkles, Globe, 
  Users, Building2, Calendar, Hash, CheckCircle2, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// DEBUG: Check if API key exists
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('GEMINI KEY EXISTS?', !!GEMINI_API_KEY);

const suggestions = [
  { icon: Users, text: 'Rajat Sharma connection with BJP and political ecosystem' },
  { icon: Building2, text: 'Adani Group relationship with Indian government officials' },
  { icon: Calendar, text: 'Cambridge Analytica and the 2016 election influence operation' },
  { icon: Globe, text: 'George Soros Open Society network and political funding' },
  { icon: Hash, text: 'Sam Altman OpenAI board crisis power dynamics' },
  { icon: Users, text: 'Elon Musk acquisition of Twitter and political realignment' },
];

const AGENT_STAGES = [
  { id: 'query',    label: 'Query Intelligence Parser',       desc: 'Classifying entity type, context, and investigation scope...' },
  { id: 'osint',    label: 'OSINT Research Agent',            desc: 'Scanning open sources, archives, and public records...' },
  { id: 'timeline', label: 'Chronological Reconstruction Agent', desc: 'Building 11-phase timeline with sub-events...' },
  { id: 'relation', label: 'Relationship Mapping Agent',      desc: 'Detecting associations, ecosystems, and hidden clusters...' },
  { id: 'source',   label: 'Source Credibility Agent',        desc: 'Ranking evidence: court records → filings → archives...' },
  { id: 'narrative',label: 'Narrative Analysis Agent',        desc: 'Analyzing media framing, propaganda signals, contradictions...' },
  { id: 'report',   label: 'Intelligence Report Generator',   desc: 'Compiling dossier with citations and confidence scoring...' },
];

async function askGemini(query) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key is missing. Add VITE_GEMINI_API_KEY in Vercel Settings → Environment Variables, then redeploy.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are NEXUS, a multi-agent investigative intelligence platform. Analyze the following query and provide a structured intelligence report:

Query: "${query}"

Provide your response in this exact JSON format:
{
  "title": "Investigation Title",
  "summary": "Executive summary of findings",
  "entities_analyzed": ["Entity 1", "Entity 2"],
  "timeline_events": [
    {"date": "YYYY-MM-DD", "event": "Event description", "significance": "high/medium/low"}
  ],
  "relationships": [
    {"source": "Entity A", "target": "Entity B", "type": "financial/political/personal", "evidence": "Description"}
  ],
  "narrative_analysis": {
    "main_narrative": "Primary media narrative",
    "contradictions": ["Contradiction 1"],
    "propaganda_signals": ["Signal 1"]
  },
  "intelligence_report": "Detailed analysis report",
  "confidence_score": 85,
  "tags": ["tag1", "tag2"]
}

Be thorough, analytical, and provide specific details. Include dates, names, and concrete evidence where possible.`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  console.log('Gemini raw response:', data);

  if (data.error) {
    throw new Error(data.error.message || 'Gemini API error');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    return {
      title: query,
      summary: text.substring(0, 500),
      entities_analyzed: [],
      timeline_events: [],
      relationships: [],
      narrative_analysis: { main_narrative: text, contradictions: [], propaganda_signals: [] },
      intelligence_report: text,
      confidence_score: 70,
      tags: []
    };
  }
}

export default function IntelligenceSearch() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [completedStages, setCompletedStages] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setCompletedStages([]);
    setActiveStage(0);

    const stageTimings = [2000, 4000, 6500, 9000, 11500, 14000, 16000];
    stageTimings.forEach((ms, idx) => {
      setTimeout(() => {
        setCompletedStages(prev => [...prev, idx - 1].filter(i => i >= 0));
        setActiveStage(idx);
      }, ms);
    });

    try {
      console.log('Starting search for:', q);
      const aiResult = await askGemini(q);
      console.log('AI Result:', aiResult);

      const investigation = {
        id: Date.now().toString(),
        title: aiResult.title || q,
        query: q,
        status: 'active',
        summary: aiResult.summary || 'Analysis completed',
        entities_analyzed: aiResult.entities_analyzed || [],
        timeline_events: aiResult.timeline_events || [],
        relationships: aiResult.relationships || [],
        narrative_analysis: aiResult.narrative_analysis || {},
        intelligence_report: aiResult.intelligence_report || '',
        confidence_score: aiResult.confidence_score || 0,
        tags: aiResult.tags || [],
      };

      const existing = JSON.parse(localStorage.getItem('investigations') || '[]');
      localStorage.setItem('investigations', JSON.stringify([investigation, ...existing]));

      setIsAnalyzing(false);
      setActiveStage(-1);
      navigate(`/investigation?id=${investigation.id}`);
    } catch (error) {
      console.error('Search error:', error);
      setIsAnalyzing(false);
      setActiveStage(-1);
      alert('ERROR: ' + error.message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="pt-8 lg:pt-14 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-mono text-primary tracking-wider">MULTI-AGENT INVESTIGATIVE INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Intelligence Search</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Search any person, organization, event, movement, or narrative. Seven specialized AI agents reconstruct timelines, map influence ecosystems, analyze narratives, and generate deep intelligence dossiers.
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass rounded-xl p-1.5 glow-primary">
          <div className="flex items-center gap-2">
            <div className="pl-4">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Rajat Sharma connection with BJP — or any entity, event, relationship..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 py-3.5 px-2 text-sm"
              disabled={isAnalyzing}
            />
            <Button
              onClick={() => handleSearch()}
              disabled={isAnalyzing || !query.trim()}
              className="bg-primary hover:bg-primary/90 font-mono text-xs tracking-wider px-6 mr-1"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>INVESTIGATE <ArrowRight className="w-3.5 h-3.5 ml-2" /></>}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-6"
          >
            <Card className="glass p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center relative">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Deep Investigation Underway</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {activeStage >= 0 ? AGENT_STAGES[activeStage]?.desc : 'Finalizing...'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {AGENT_STAGES.map((stage, i) => {
                  const isDone = completedStages.includes(i);
                  const isActive = activeStage === i;
                  return (
                    <div key={stage.id} className="flex items-center gap-3">
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : isActive ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-4 h-4 text-primary" />
                          </motion.div>
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-mono ${isDone ? 'text-muted-foreground line-through' : isActive ? 'text-foreground font-medium' : 'text-muted-foreground/50'}`}>
                          {stage.label}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div className="w-24 h-1 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: '5%' }}
                            animate={{ width: '95%' }}
                            transition={{ duration: 2.5, ease: 'easeInOut' }}
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 text-[10px] font-mono text-muted-foreground/40 tracking-wider">
                ANALYSIS DEPTH: 11-PHASE TIMELINE · PRIMARY SOURCE PRIORITY · EVIDENCE HIERARCHY
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <p className="text-[10px] text-muted-foreground font-mono mb-4 tracking-widest">SUGGESTED DEEP INVESTIGATIONS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                onClick={() => { setQuery(s.text); handleSearch(s.text); }}
                className="glass rounded-lg p-3 text-left hover:border-primary/30 transition-all group flex items-center gap-3"
              >
                <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 p-4 glass rounded-lg border-border/30">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">What this platform investigates</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  People · Politicians · Organizations · Media figures · Corporations · Movements · Ideologies · Events · Controversies · Elections · Policies · Networks · Funding flows · Propaganda campaigns
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <p className="text-[10px] font-mono text-muted-foreground/30 tracking-wider">
          AI INFERENCE — VERIFY CRITICAL CLAIMS INDEPENDENTLY
        </p>
      </div>
    </div>
  );
}
