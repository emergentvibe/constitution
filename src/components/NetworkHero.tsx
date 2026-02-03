"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  neighbors: number[];
}

interface Edge {
  from: number;
  to: number;
  length: number;
}

interface Spotlight {
  currentNode: number;
  targetNode: number;
  progress: number; // 0 to 1 along current edge
  speed: number;
  radius: number;
  intensity: number;
}

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const spotlightsRef = useRef<Spotlight[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      generateNetwork(rect.width, rect.height);
      generateSpotlights();
    };

    // Generate a connected network using proximity + ensuring connectivity
    const generateNetwork = (width: number, height: number) => {
      const nodes: Node[] = [];
      const nodeCount = 80;
      
      // Create nodes in relaxed grid with jitter
      const cols = 10;
      const rows = 8;
      const cellW = width / cols;
      const cellH = height / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (nodes.length >= nodeCount) break;
          nodes.push({
            x: cellW * (col + 0.2 + Math.random() * 0.6),
            y: cellH * (row + 0.2 + Math.random() * 0.6),
            neighbors: [],
          });
        }
      }
      
      // Build edges using Delaunay-like approach: connect to nearby nodes
      const edges: Edge[] = [];
      const maxDist = Math.max(cellW, cellH) * 1.8;
      
      for (let i = 0; i < nodes.length; i++) {
        // Find nearby nodes and connect
        const nearby: { idx: number; dist: number }[] = [];
        
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dist = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) +
            Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          if (dist < maxDist) {
            nearby.push({ idx: j, dist });
          }
        }
        
        // Sort by distance, connect to closest 3-4
        nearby.sort((a, b) => a.dist - b.dist);
        const connectCount = 2 + Math.floor(Math.random() * 2);
        
        for (let k = 0; k < Math.min(connectCount, nearby.length); k++) {
          const j = nearby[k].idx;
          
          // Avoid duplicate edges
          if (!nodes[i].neighbors.includes(j)) {
            nodes[i].neighbors.push(j);
            nodes[j].neighbors.push(i);
            edges.push({ from: i, to: j, length: nearby[k].dist });
          }
        }
      }
      
      nodesRef.current = nodes;
      edgesRef.current = edges;
    };

    // Generate spotlights that travel along edges
    const generateSpotlights = () => {
      const nodes = nodesRef.current;
      if (nodes.length === 0) return;
      
      const spotlights: Spotlight[] = [];
      
      // Large slow spotlights (wide, dim)
      for (let i = 0; i < 3; i++) {
        const startNode = Math.floor(Math.random() * nodes.length);
        spotlights.push({
          currentNode: startNode,
          targetNode: nodes[startNode].neighbors[0] || startNode,
          progress: Math.random(),
          speed: 0.15 + Math.random() * 0.1,
          radius: 200 + Math.random() * 100,
          intensity: 0.4 + Math.random() * 0.2,
        });
      }
      
      // Medium spotlights
      for (let i = 0; i < 5; i++) {
        const startNode = Math.floor(Math.random() * nodes.length);
        spotlights.push({
          currentNode: startNode,
          targetNode: nodes[startNode].neighbors[0] || startNode,
          progress: Math.random(),
          speed: 0.3 + Math.random() * 0.2,
          radius: 80 + Math.random() * 60,
          intensity: 0.6 + Math.random() * 0.3,
        });
      }
      
      // Small fast spotlights (narrow, bright)
      for (let i = 0; i < 7; i++) {
        const startNode = Math.floor(Math.random() * nodes.length);
        spotlights.push({
          currentNode: startNode,
          targetNode: nodes[startNode].neighbors[0] || startNode,
          progress: Math.random(),
          speed: 0.5 + Math.random() * 0.3,
          radius: 30 + Math.random() * 30,
          intensity: 0.8 + Math.random() * 0.4,
        });
      }
      
      spotlightsRef.current = spotlights;
    };

    // Get spotlight position (interpolated along edge)
    const getSpotlightPos = (spotlight: Spotlight): { x: number; y: number } => {
      const nodes = nodesRef.current;
      const from = nodes[spotlight.currentNode];
      const to = nodes[spotlight.targetNode];
      
      if (!from || !to) return { x: 0, y: 0 };
      
      return {
        x: from.x + (to.x - from.x) * spotlight.progress,
        y: from.y + (to.y - from.y) * spotlight.progress,
      };
    };

    // Calculate brightness boost from spotlights
    const getBrightnessBoost = (x: number, y: number): number => {
      let boost = 0;
      
      for (const spotlight of spotlightsRef.current) {
        const pos = getSpotlightPos(spotlight);
        const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        
        if (dist < spotlight.radius) {
          const falloff = 1 - (dist / spotlight.radius);
          boost += falloff * falloff * spotlight.intensity;
        }
      }
      
      return Math.min(1, boost);
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const dt = 0.016;
      timeRef.current += dt;

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      
      // Update spotlight positions (move along edges)
      for (const spotlight of spotlightsRef.current) {
        spotlight.progress += spotlight.speed * dt;
        
        // Reached target node - pick new target
        if (spotlight.progress >= 1) {
          spotlight.progress = 0;
          spotlight.currentNode = spotlight.targetNode;
          
          // Pick random neighbor as next target
          const neighbors = nodes[spotlight.currentNode]?.neighbors || [];
          if (neighbors.length > 0) {
            spotlight.targetNode = neighbors[Math.floor(Math.random() * neighbors.length)];
          }
        }
      }

      const gold = { r: 201, g: 162, b: 39 };
      const silver = { r: 123, g: 155, b: 173 };
      
      // Base opacity for always-visible network
      const baseOpacity = 0.12;

      // Draw edges
      ctx.lineCap = "round";
      for (const edge of edges) {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const boost = getBrightnessBoost(midX, midY);
        
        const colorMix = midX / width;
        const color = {
          r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
          g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
          b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
        };
        
        const opacity = baseOpacity + boost * 0.35;
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        ctx.lineWidth = 1 + boost * 1.5;
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const boost = getBrightnessBoost(node.x, node.y);
        
        const colorMix = node.x / width;
        const color = {
          r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
          g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
          b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
        };
        
        // Glow (only when boosted)
        if (boost > 0.1) {
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${boost * 0.2})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6 + boost * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Core (always visible)
        const coreOpacity = baseOpacity + boost * 0.5;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${coreOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 + boost * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
