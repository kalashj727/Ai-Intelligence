import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, ZoomIn, ZoomOut, Maximize2, Loader2, 
  X, ChevronRight, Expand, Target, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { buildNodeExpansionPrompt, NODE_EXPANSION_SCHEMA } from '@/lib/investigationPrompt';

// ─── Force Simulation ─────────────────────────────────────────────────────────
function runForceLayout(nodes, edges, width, height, iterations = 120) {
  const pos = {};
  const centerX = width / 2;
  const centerY = height / 2;

  nodes.forEach((node, i) => {
    if (pos[node.id]) return; // preserve existing positions
    const angle = (2 * Math.PI * i) / nodes.length;
    const r = Math.min(width, height) * 0.3;
    pos[node.id] = {
      x: centerX + r * Math.cos(angle) + (Math.random() - 0.5) * 60,
      y: centerY + r * Math.sin(angle) + (Math.random() - 0.5) * 60,
      vx: 0, vy: 0,
    };
  });

  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = pos[nodes[i].id];
        const b = pos[nodes[j].id];
        if (!a || !b) continue;
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (6000 / (dist * dist)) * cooling;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const a = pos[edge.source];
      const b = pos[edge.target];
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const targetDist = 160;
      const force = (dist - targetDist) * 0.008 * cooling;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    });

    // Update positions
    nodes.forEach(node => {
      const p = pos[node.id];
      if (!p) return;
      p.vx += (centerX - p.x) * 0.001;
      p.vy += (centerY - p.y) * 0.001;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x = Math.max(60, Math.min(width - 60, p.x + p.vx));
      p.y = Math.max(60, Math.min(height - 60, p.y + p.vy));
    });
  }

  return pos;
}

// ─── Type Colors & Sizes ──────────────────────────────────────────────────────
const TYPE_COLORS = {
  person:          { fill: '#0ea5e9', stroke: '#38bdf8', glow: 'rgba(14,165,233,0.3)' },
  organization:    { fill: '#8b5cf6', stroke: '#a78bfa', glow: 'rgba(139,92,246,0.3)' },
  corporation:     { fill: '#7c3aed', stroke: '#8b5cf6', glow: 'rgba(124,58,237,0.3)' },
  media:           { fill: '#ec4899', stroke: '#f472b6', glow: 'rgba(236,72,153,0.3)' },
  political_party: { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245,158,11,0.3)' },
  government_body: { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239,68,68,0.3)' },
  movement:        { fill: '#22c55e', stroke: '#4ade80', glow: 'rgba(34,197,94,0.3)' },
  event:           { fill: '#06b6d4', stroke: '#22d3ee', glow: 'rgba(6,182,212,0.3)' },
  ideology:        { fill: '#d946ef', stroke: '#e879f9', glow: 'rgba(217,70,239,0.3)' },
  unknown:         { fill: '#64748b', stroke: '#94a3b8', glow: 'rgba(100,116,139,0.3)' },
};

const EDGE_COLORS = {
  political_ally:       '#f59e0b',
  business_partner:     '#8b5cf6',
  media_proximity:      '#ec4899',
  funding_relationship: '#22c55e',
  adversarial:          '#ef4444',
  ideological_overlap:  '#d946ef',
  mentor_mentee:        '#06b6d4',
  default:              '#0ea5e9',
};

const EVIDENCE_OPACITY = {
  verified: 0.9,
  reported: 0.65,
  alleged:  0.4,
  inferred: 0.25,
};

// ─── Node Detail Panel ────────────────────────────────────────────────────────
function NodeDetailPanel({ node, allEdges, onExpand, onClose, isExpanding }) {
  if (!node) return null;

  const nodeEdges = allEdges.filter(e => e.source === node.id || e.target === node.id);
  const colors = TYPE_COLORS[node.type] || TYPE_COLORS.unknown;

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-2 right-2 w-72 glass-strong rounded-xl p-4 z-20 max-h-[90%] overflow-y-auto"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.fill }} />
          <span className="text-xs font-mono text-muted-foreground capitalize">{node.type}</span>
        </div>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="text-sm font-bold mb-1">{node.id}</h3>
      {node.significance && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{node.significance}</p>
      )}

      {/* Connections */}
      {nodeEdges.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2">
            CONNECTIONS ({nodeEdges.length})
          </p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {nodeEdges.slice(0, 8).map((edge, i) => {
              const other = edge.source === node.id ? edge.target : edge.source;
              const edgeColor = EDGE_COLORS[edge.relationship_type] || EDGE_COLORS.default;
              return (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: edgeColor }} />
                  <span className="text-muted-foreground truncate flex-1">{other}</span>
                  <span className="text-muted-foreground/50 shrink-0">{edge.confidence_score || edge.strength}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expand Button */}
      <Button
        onClick={() => onExpand(node)}
        disabled={isExpanding}
        className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-mono"
        variant="outline"
        size="sm"
      >
        {isExpanding ? (
          <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> EXPANDING NODE...</>
        ) : (
          <><Expand className="w-3.5 h-3.5 mr-2" /> EXPAND INTELLIGENCE</>
        )}
      </Button>

      {node.isNew && (
        <div className="mt-2 text-center">
          <Badge className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">NEW — Just discovered</Badge>
        </div>
      )}
    </motion.div>
  );
}

// ─── Edge Tooltip ─────────────────────────────────────────────────────────────
function EdgeTooltip({ edge, x, y }) {
  if (!edge) return null;
  return (
    <div
      className="absolute pointer-events-none glass-strong rounded-lg p-3 text-xs z-30 max-w-xs"
      style={{ left: x + 10, top: y - 60 }}
    >
      <div className="font-semibold mb-1">
        {edge.source} → {edge.target}
      </div>
      <div className="text-muted-foreground space-y-0.5">
        <div>Type: <span className="text-foreground">{edge.relationship_type || edge.type}</span></div>
        {edge.confidence_score && <div>Confidence: <span className="text-primary">{edge.confidence_score}%</span></div>}
        {edge.timeline_range && <div>Period: <span className="text-foreground">{edge.timeline_range}</span></div>}
        {edge.evidence_type && <div>Evidence: <span className={
          edge.evidence_type === 'verified' ? 'text-green-400' :
          edge.evidence_type === 'reported' ? 'text-chart-4' :
          edge.evidence_type === 'alleged' ? 'text-orange-400' : 'text-muted-foreground'
        }>[{edge.evidence_type}]</span></div>}
        {edge.description && <div className="mt-1 text-muted-foreground/70 leading-relaxed">{edge.description.slice(0, 120)}{edge.description.length > 120 ? '...' : ''}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveRelationshipGraph({ 
  relationships = [], 
  entities = [], 
  investigationQuery = '',
  onGraphExpanded,
}) {
  const [graphRelationships, setGraphRelationships] = useState(relationships);
  const [graphEntities, setGraphEntities] = useState(entities);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandingNode, setExpandingNode] = useState(null);
  const [newNodes, setNewNodes] = useState(new Set());
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [edgeTooltipPos, setEdgeTooltipPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [expandLog, setExpandLog] = useState([]);
  const [positions, setPositions] = useState({});
  const svgRef = useRef(null);
  const W = 900, H = 600;

  // Sync when props change
  useEffect(() => {
    setGraphRelationships(relationships);
    setGraphEntities(entities);
  }, [relationships.length, entities.length]);

  // Build nodes from relationships + entities
  const nodes = useMemo(() => {
    const nodeMap = new Map();
    (graphEntities || []).forEach(e => nodeMap.set(e.name, { 
      id: e.name, type: e.type || 'unknown', significance: e.significance,
      isNew: newNodes.has(e.name)
    }));
    (graphRelationships || []).forEach(r => {
      if (r.source && !nodeMap.has(r.source)) nodeMap.set(r.source, { id: r.source, type: 'unknown', isNew: newNodes.has(r.source) });
      if (r.target && !nodeMap.has(r.target)) nodeMap.set(r.target, { id: r.target, type: 'unknown', isNew: newNodes.has(r.target) });
    });
    return Array.from(nodeMap.values());
  }, [graphRelationships, graphEntities, newNodes]);

  // Recompute layout when nodes change
  useEffect(() => {
    if (!nodes.length) return;
    setPositions(prev => {
      // Preserve existing positions, only add new nodes
      const existingNodes = nodes.filter(n => prev[n.id]);
      const newNodesList = nodes.filter(n => !prev[n.id]);
      const merged = { ...prev };
      if (newNodesList.length > 0) {
        const allPos = runForceLayout(nodes, graphRelationships, W, H, 80);
        newNodesList.forEach(n => { merged[n.id] = allPos[n.id]; });
      }
      return merged;
    });
  }, [nodes.length]);

  // Initial layout
  useEffect(() => {
    if (!nodes.length) return;
    const pos = runForceLayout(nodes, graphRelationships, W, H, 150);
    setPositions(pos);
  }, []);

  // ─── Node Expansion ──────────────────────────────────────────────────────
  const expandNode = useCallback(async (node) => {
    setExpandingNode(node.id);
    setSelectedNode(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: buildNodeExpansionPrompt(
        node.id,
        node.type,
        investigationQuery,
        graphEntities,
        graphRelationships
      ),
      add_context_from_internet: true,
      response_json_schema: NODE_EXPANSION_SCHEMA,
      model: 'gemini_3_flash',
    });

    const addedNodes = new Set(newNodes);
    const addedRelKeys = new Set(graphRelationships.map(r => `${r.source}__${r.target}`));

    // Merge new entities
    const mergedEntities = [...graphEntities];
    (result.new_entities || []).forEach(e => {
      if (!mergedEntities.find(x => x.name === e.name)) {
        mergedEntities.push(e);
        addedNodes.add(e.name);
      }
    });

    // Merge new relationships (deduplicated)
    const mergedRel = [...graphRelationships];
    (result.new_relationships || []).forEach(r => {
      const key = `${r.source}__${r.target}`;
      const keyRev = `${r.target}__${r.source}`;
      if (!addedRelKeys.has(key) && !addedRelKeys.has(keyRev)) {
        mergedRel.push(r);
        addedRelKeys.add(key);
        // Auto-add any nodes referenced
        if (!mergedEntities.find(x => x.name === r.source)) {
          mergedEntities.push({ name: r.source, type: 'unknown' });
          addedNodes.add(r.source);
        }
        if (!mergedEntities.find(x => x.name === r.target)) {
          mergedEntities.push({ name: r.target, type: 'unknown' });
          addedNodes.add(r.target);
        }
      }
    });

    setNewNodes(addedNodes);
    setGraphEntities(mergedEntities);
    setGraphRelationships(mergedRel);
    setExpandingNode(null);

    // Log expansion
    setExpandLog(prev => [{
      node: node.id,
      added_entities: result.new_entities?.length || 0,
      added_relations: result.new_relationships?.length || 0,
      summary: result.expanded_node_summary || '',
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 6));

    // Notify parent
    if (onGraphExpanded) {
      onGraphExpanded({
        new_entities: result.new_entities || [],
        new_relationships: result.new_relationships || [],
        new_timeline_events: result.new_timeline_events || [],
      });
    }
  }, [graphEntities, graphRelationships, investigationQuery, newNodes, onGraphExpanded]);

  // ─── Pan & Zoom ──────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e) => {
    if (isPanning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  if (!relationships?.length && !graphRelationships?.length) {
    return (
      <div className="text-center py-12">
        <Network className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No relationship data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expansion Status Bar */}
      {expandingNode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20"
        >
          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          <div>
            <span className="text-xs font-mono text-primary">EXPANDING NODE: {expandingNode}</span>
            <p className="text-[10px] text-muted-foreground">Running contextual intelligence research...</p>
          </div>
        </motion.div>
      )}

      {/* Graph Canvas */}
      <div className="relative">
        {/* Controls */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => setZoom(z => Math.min(z + 0.2, 3))}>
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))}>
            <ZoomOut className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Stats */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <div className="glass rounded-md px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
            {nodes.length} nodes · {graphRelationships.length} edges
          </div>
          {newNodes.size > 0 && (
            <div className="glass rounded-md px-2.5 py-1 text-[10px] font-mono text-green-400">
              +{newNodes.size} expanded
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="glass rounded-md px-2.5 py-1 text-[10px] font-mono text-muted-foreground/60">
            Click any node to inspect · Click "Expand Intelligence" to deepen
          </div>
        </div>

        {/* SVG */}
        <div
          className="overflow-hidden rounded-xl glass cursor-grab active:cursor-grabbing"
          style={{ height: H }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              {Object.entries(TYPE_COLORS).map(([type, c]) => (
                <radialGradient key={type} id={`glow-${type}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={c.fill} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={c.fill} stopOpacity="0" />
                </radialGradient>
              ))}
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="rgba(14,165,233,0.4)" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {graphRelationships.map((edge, i) => {
                const from = positions[edge.source];
                const to = positions[edge.target];
                if (!from || !to) return null;
                const color = EDGE_COLORS[edge.relationship_type] || EDGE_COLORS.default;
                const opacity = EVIDENCE_OPACITY[edge.evidence_type] || 0.4;
                const conf = edge.confidence_score || edge.strength || 5;
                const strokeW = Math.max(0.8, (conf / 100) * 3.5);
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;

                return (
                  <g key={`e-${i}`}
                    onMouseEnter={(e) => {
                      setHoveredEdge(edge);
                      const rect = svgRef.current?.closest('div')?.getBoundingClientRect();
                      if (rect) setEdgeTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onMouseLeave={() => setHoveredEdge(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={color}
                      strokeOpacity={opacity * (hoveredEdge === edge ? 1 : 0.6)}
                      strokeWidth={hoveredEdge === edge ? strokeW * 2 : strokeW}
                      strokeDasharray={edge.evidence_type === 'inferred' ? '4 3' : edge.evidence_type === 'alleged' ? '2 2' : 'none'}
                    />
                    {/* Edge label */}
                    {zoom > 0.7 && (
                      <text x={mx} y={my - 4} fill={color} fillOpacity={0.7} fontSize="7"
                        textAnchor="middle" fontFamily="JetBrains Mono" pointerEvents="none">
                        {(edge.relationship_type || edge.type || '').replace(/_/g, ' ')}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const pos = positions[node.id];
                if (!pos) return null;
                const colors = TYPE_COLORS[node.type] || TYPE_COLORS.unknown;
                const isSelected = selectedNode?.id === node.id;
                const isExpanding_ = expandingNode === node.id;
                const isNew = newNodes.has(node.id);
                const r = isSelected ? 12 : 9;

                return (
                  <g key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(selectedNode?.id === node.id ? null : node);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Glow ring for new nodes */}
                    {isNew && (
                      <circle cx={pos.x} cy={pos.y} r={r + 10} fill={colors.fill} fillOpacity={0.08}>
                        <animate attributeName="r" values={`${r + 6};${r + 14};${r + 6}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="fill-opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Selection ring */}
                    {isSelected && (
                      <circle cx={pos.x} cy={pos.y} r={r + 7} fill="none"
                        stroke={colors.fill} strokeWidth="1.5" strokeOpacity="0.6"
                        strokeDasharray="4 2">
                        <animateTransform attributeName="transform" type="rotate"
                          from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`} dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Expanding pulse */}
                    {isExpanding_ && (
                      <circle cx={pos.x} cy={pos.y} r={r + 4} fill={colors.fill} fillOpacity={0.15}>
                        <animate attributeName="r" values={`${r};${r + 20};${r}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="fill-opacity" values="0.2;0;0.2" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Main node */}
                    <circle cx={pos.x} cy={pos.y} r={r}
                      fill={colors.fill} fillOpacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#fff' : colors.stroke}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeOpacity={0.6}
                    />

                    {/* Label */}
                    <text x={pos.x} y={pos.y + r + 11}
                      fill={isNew ? '#4ade80' : '#e2e8f0'}
                      fontSize={isSelected ? 11 : 9}
                      textAnchor="middle"
                      fontFamily="Inter"
                      fontWeight={isSelected ? '700' : '400'}
                      pointerEvents="none"
                    >
                      {node.id.length > 18 ? node.id.slice(0, 16) + '…' : node.id}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Edge Tooltip */}
        {hoveredEdge && (
          <EdgeTooltip edge={hoveredEdge} x={edgeTooltipPos.x} y={edgeTooltipPos.y} />
        )}

        {/* Node Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              allEdges={graphRelationships}
              onExpand={expandNode}
              onClose={() => setSelectedNode(null)}
              isExpanding={!!expandingNode}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'unknown').map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
            <span className="text-[10px] text-muted-foreground capitalize">{type.replace(/_/g, ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-5 h-px bg-primary/70" />
          <span className="text-[10px] text-muted-foreground">verified</span>
          <div className="w-5 h-px border-t-2 border-dashed border-primary/40" />
          <span className="text-[10px] text-muted-foreground">inferred</span>
        </div>
      </div>

      {/* Expansion Log */}
      {expandLog.length > 0 && (
        <div className="glass rounded-lg p-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2">EXPANSION LOG</p>
          <div className="space-y-1.5">
            {expandLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-[11px]">
                <span className="font-mono text-muted-foreground/50 shrink-0">{log.timestamp}</span>
                <span className="text-primary font-medium shrink-0">{log.node}</span>
                <span className="text-muted-foreground">
                  +{log.added_entities} entities · +{log.added_relations} connections
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
