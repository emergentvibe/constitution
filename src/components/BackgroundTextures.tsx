"use client";

import { useEffect, useRef, useState } from "react";

// Types
interface Point {
  x: number;
  y: number;
}

interface Attractor extends Point {
  active: boolean;
}

interface Node extends Point {
  parent: number | null;
  color: 'gold' | 'silver';
}

interface Branch {
  from: Point;
  to: Point;
  color: 'gold' | 'silver';
  thickness: number;
  age: number;
}

// Space colonization algorithm
class SpaceColonization {
  width: number;
  height: number;
  attractors: Attractor[] = [];
  nodes: Node[] = [];
  branches: Branch[] = [];
  
  attractionDistance = 150; // how far attractors can influence
  killDistance = 15; // when attractor is consumed
  stepSize = 8; // how far branches grow each step
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.init();
  }
  
  init() {
    // Scatter attractors across the viewport (avoiding center for content)
    const margin = 100;
    const centerAvoidX = this.width * 0.35;
    const centerAvoidY = this.height * 0.25;
    
    for (let i = 0; i < 80; i++) {
      const x = margin + Math.random() * (this.width - margin * 2);
      const y = margin + Math.random() * (this.height - margin * 2);
      
      // Avoid center where content lives
      const distFromCenter = Math.sqrt(
        Math.pow(x - this.width / 2, 2) + 
        Math.pow(y - this.height / 2, 2)
      );
      
      if (distFromCenter > Math.min(centerAvoidX, centerAvoidY)) {
        this.attractors.push({ x, y, active: true });
      }
    }
    
    // Seed nodes at corners
    this.nodes.push({ x: 0, y: 0, parent: null, color: 'gold' });
    this.nodes.push({ x: this.width, y: 0, parent: null, color: 'silver' });
    this.nodes.push({ x: 0, y: this.height, parent: null, color: 'silver' });
    this.nodes.push({ x: this.width, y: this.height, parent: null, color: 'gold' });
    
    // Additional seeds along edges
    this.nodes.push({ x: this.width * 0.3, y: 0, parent: null, color: 'gold' });
    this.nodes.push({ x: this.width * 0.7, y: 0, parent: null, color: 'silver' });
    this.nodes.push({ x: 0, y: this.height * 0.4, parent: null, color: 'gold' });
    this.nodes.push({ x: this.width, y: this.height * 0.6, parent: null, color: 'silver' });
  }
  
  step(): boolean {
    // For each node, find influencing attractors
    const influences: Map<number, Point[]> = new Map();
    
    for (const attractor of this.attractors) {
      if (!attractor.active) continue;
      
      let closestNode: number | null = null;
      let closestDist = Infinity;
      
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const dist = this.distance(attractor, node);
        
        if (dist < this.killDistance) {
          // Attractor reached - consume it
          attractor.active = false;
          closestNode = null;
          break;
        }
        
        if (dist < this.attractionDistance && dist < closestDist) {
          closestDist = dist;
          closestNode = i;
        }
      }
      
      if (closestNode !== null) {
        if (!influences.has(closestNode)) {
          influences.set(closestNode, []);
        }
        influences.get(closestNode)!.push(attractor);
      }
    }
    
    // Grow nodes toward their influencing attractors
    let grew = false;
    const newNodes: Node[] = [];
    
    influences.forEach((attrs, nodeIdx) => {
      const node = this.nodes[nodeIdx];
      
      // Average direction to all influencing attractors
      let dirX = 0;
      let dirY = 0;
      
      for (const attr of attrs) {
        const dx = attr.x - node.x;
        const dy = attr.y - node.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        dirX += dx / len;
        dirY += dy / len;
      }
      
      // Normalize and step
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      if (len > 0) {
        dirX /= len;
        dirY /= len;
        
        // Add some randomness for organic feel
        dirX += (Math.random() - 0.5) * 0.3;
        dirY += (Math.random() - 0.5) * 0.3;
        
        const newX = node.x + dirX * this.stepSize;
        const newY = node.y + dirY * this.stepSize;
        
        // Create new node
        const newNode: Node = {
          x: newX,
          y: newY,
          parent: nodeIdx,
          color: node.color,
        };
        newNodes.push(newNode);
        
        // Create branch
        const depth = this.getDepth(nodeIdx);
        this.branches.push({
          from: { x: node.x, y: node.y },
          to: { x: newX, y: newY },
          color: node.color,
          thickness: Math.max(0.5, 3 - depth * 0.3),
          age: 0,
        });
        
        grew = true;
      }
    });
    
    this.nodes.push(...newNodes);
    
    // Age branches
    for (const branch of this.branches) {
      branch.age++;
    }
    
    return grew;
  }
  
  getDepth(nodeIdx: number): number {
    let depth = 0;
    let current = nodeIdx;
    while (this.nodes[current]?.parent !== null) {
      current = this.nodes[current].parent!;
      depth++;
    }
    return depth;
  }
  
  distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
}

export default function BackgroundTextures() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [nodes, setNodes] = useState<Point[]>([]);
  const simulationRef = useRef<SpaceColonization | null>(null);
  const frameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  
  useEffect(() => {
    // Get actual viewport dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Initialize simulation
    simulationRef.current = new SpaceColonization(dimensions.width, dimensions.height);
    
    let iteration = 0;
    const maxIterations = 150;
    
    const animate = () => {
      if (!simulationRef.current) return;
      
      const grew = simulationRef.current.step();
      
      // Update state for rendering
      setBranches([...simulationRef.current.branches]);
      
      // Collect significant nodes for rendering
      const significantNodes = simulationRef.current.nodes.filter((_, i) => {
        const depth = simulationRef.current!.getDepth(i);
        return depth > 0 && depth % 3 === 0; // every 3rd depth level
      });
      setNodes(significantNodes.map(n => ({ x: n.x, y: n.y })));
      
      iteration++;
      
      if (grew && iteration < maxIterations) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameRef.current);
    };
  }, [dimensions]);
  
  const gold = "#C9A227";
  const silver = "#7B9BAD";
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle gradient wash */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(201,162,39,0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(123,155,173,0.06) 0%, transparent 50%)',
        }}
      />
      
      {/* Space colonization network */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Branches */}
        {branches.map((branch, i) => (
          <line
            key={i}
            x1={branch.from.x}
            y1={branch.from.y}
            x2={branch.to.x}
            y2={branch.to.y}
            stroke={branch.color === 'gold' ? gold : silver}
            strokeWidth={branch.thickness}
            strokeLinecap="round"
            opacity={Math.min(0.6, 0.1 + branch.age * 0.02)}
            style={{
              transition: 'opacity 0.5s ease-out',
            }}
          />
        ))}
        
        {/* Nodes at branch points */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={4}
              fill={i % 2 === 0 ? gold : silver}
              opacity={0.3}
              style={{
                animation: 'nodePulse 4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
