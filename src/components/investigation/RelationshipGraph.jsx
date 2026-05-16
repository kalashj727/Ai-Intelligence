import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function useSimulation(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes.length) return;

    const pos = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      pos[node.id] = {
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });

    // Simple force simulation
    const iterate = () => {
      const k = 0.01;
      const repulsion = 5000;
      const damping = 0.85;

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = pos[nodes[i].id];
          const b = pos[nodes[j].id];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // Attraction along edges
      edges.forEach(edge => {
        const a = pos[edge.source];
        const b = pos[edge.target];
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 150) * k;
        const fx = (dx / Math.max(dist, 1)) * force;
        const fy = (dy / Math.max(dist, 1)) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Center gravity
      nodes.forEach(node => {
        const p = pos[node.id];
        p.vx += (centerX - p.x) * 0.001;
        p.vy += (centerY - p.y) * 0.001;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;
        // Boundary
        p.x = Math.max(50, Math.min(width - 50, p.x));
        p.y = Math.max(50, Math.min(height - 50, p.y));
      });
    };

    for (let i = 0; i < 100; i++) iterate();
    setPositions({ ...pos });
  }, [nodes, edges, width, height]);

  return positions;
}

export default function RelationshipGraph({ relationships = [], entities = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const width = 800;
  const height = 500;

  const { nodes, edges } = useMemo(() => {
    const nodeSet = new Set();
    const edgeList = [];

    (relationships || []).forEach(r => {
      if (r.source) nodeSet.add(r.source);
      if (r.target) nodeSet.add(r.target);
      edgeList.push(r);
    });

    const nodeList = Array.from(nodeSet).map(name => {
      const entity = (entities || []).find(e => e.name === name);
      return { id: name, type: entity?.type || 'unknown', significance: entity?.significance };
    });

    return { nodes: nodeList, edges: edgeList };
  }, [relationships, entities]);

  const positions = useSimulation(nodes, edges, width, height);

  if (!relationships?.length) {
    return (
      <div className="text-center py-12">
        <Network className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No relationship data available</p>
      </div>
    );
  }

  const typeColors = {
    person: '#0ea5e9',
    organization: '#8b5cf6',
    event: '#f59e0b',
    movement: '#22c55e',
    policy: '#ef4444',
    unknown: '#64748b',
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 glass" onClick={() => setZoom(1)}>
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg glass" style={{ height: height }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions[edge.source];
            const to = positions[edge.target];
            if (!from || !to) return null;
            const opacity = (edge.strength || 5) / 10;
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="hsl(199 89% 48%)"
                  strokeOpacity={opacity * 0.3}
                  strokeWidth={Math.max(1, (edge.strength || 5) / 3)}
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 5}
                  fill="hsl(215 20% 55%)"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {edge.type}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const color = typeColors[node.type] || typeColors.unknown;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow */}
                <circle
                  cx={pos.x} cy={pos.y} r={isHovered ? 24 : 18}
                  fill={color}
                  fillOpacity={isHovered ? 0.15 : 0.08}
                />
                {/* Node */}
                <circle
                  cx={pos.x} cy={pos.y} r={isHovered ? 10 : 7}
                  fill={color}
                  fillOpacity={0.8}
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.3}
                />
                {/* Label */}
                <text
                  x={pos.x} y={pos.y + (isHovered ? 22 : 18)}
                  fill="hsl(210 40% 96%)"
                  fontSize={isHovered ? 11 : 9}
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(typeColors).filter(([k]) => k !== 'unknown').map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
