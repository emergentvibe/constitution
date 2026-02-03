"use client";

import { useEffect, useState, useMemo } from "react";

interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  depth: number;
  delay: number;
  color: 'gold' | 'silver';
}

// Generate a fractal tree recursively
function generateTree(
  x: number,
  y: number,
  angle: number,
  length: number,
  thickness: number,
  depth: number,
  maxDepth: number,
  delay: number,
  color: 'gold' | 'silver',
  branches: Branch[]
): void {
  if (depth > maxDepth || thickness < 0.3) return;
  
  // End point
  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;
  
  branches.push({
    x1: x,
    y1: y,
    x2,
    y2,
    thickness,
    depth,
    delay,
    color,
  });
  
  // Branching parameters with some randomness
  const branchCount = depth < 2 ? 3 : 2;
  const angleSpread = 0.4 + Math.random() * 0.3;
  const lengthRatio = 0.65 + Math.random() * 0.15;
  const thicknessRatio = 0.7;
  
  for (let i = 0; i < branchCount; i++) {
    const angleOffset = (i - (branchCount - 1) / 2) * angleSpread;
    const newAngle = angle + angleOffset + (Math.random() - 0.5) * 0.2;
    const newLength = length * lengthRatio;
    const newThickness = thickness * thicknessRatio;
    const newDelay = delay + 0.15 + Math.random() * 0.1;
    
    generateTree(
      x2, y2,
      newAngle,
      newLength,
      newThickness,
      depth + 1,
      maxDepth,
      newDelay,
      color,
      branches
    );
  }
}

// Generate all trees from edges
function generateAllTrees(width: number, height: number): Branch[] {
  const branches: Branch[] = [];
  const maxDepth = 7;
  
  // Top-left corner - gold, pointing inward
  generateTree(0, 0, Math.PI * 0.3, 80, 3.5, 0, maxDepth, 0, 'gold', branches);
  
  // Top-right corner - silver
  generateTree(width, 0, Math.PI * 0.7, 80, 3.5, 0, maxDepth, 0.2, 'silver', branches);
  
  // Bottom-left corner - silver
  generateTree(0, height, -Math.PI * 0.3, 80, 3.5, 0, maxDepth, 0.1, 'silver', branches);
  
  // Bottom-right corner - gold
  generateTree(width, height, -Math.PI * 0.7, 80, 3.5, 0, maxDepth, 0.3, 'gold', branches);
  
  // Mid-edges for more coverage
  generateTree(width * 0.35, 0, Math.PI * 0.5, 60, 2.5, 0, maxDepth - 1, 0.5, 'gold', branches);
  generateTree(width * 0.65, 0, Math.PI * 0.5, 60, 2.5, 0, maxDepth - 1, 0.6, 'silver', branches);
  
  generateTree(0, height * 0.4, 0, 60, 2.5, 0, maxDepth - 1, 0.4, 'gold', branches);
  generateTree(width, height * 0.6, Math.PI, 60, 2.5, 0, maxDepth - 1, 0.7, 'silver', branches);
  
  generateTree(width * 0.4, height, -Math.PI * 0.5, 60, 2.5, 0, maxDepth - 1, 0.8, 'silver', branches);
  generateTree(width * 0.6, height, -Math.PI * 0.5, 60, 2.5, 0, maxDepth - 1, 0.9, 'gold', branches);
  
  return branches;
}

export default function BackgroundTextures() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setMounted(true);
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Generate trees once based on dimensions
  const branches = useMemo(() => {
    return generateAllTrees(dimensions.width, dimensions.height);
  }, [dimensions.width, dimensions.height]);
  
  const gold = "#C9A227";
  const silver = "#7B9BAD";
  
  // Calculate path length for each branch (for animation)
  const getPathLength = (b: Branch) => {
    return Math.sqrt(Math.pow(b.x2 - b.x1, 2) + Math.pow(b.y2 - b.y1, 2));
  };
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle gradient wash */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(201,162,39,0.05) 0%, transparent 40%), radial-gradient(ellipse at bottom right, rgba(123,155,173,0.05) 0%, transparent 40%)',
        }}
      />
      
      {/* Fractal tree network */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {branches.map((branch, i) => {
          const pathLength = getPathLength(branch);
          const opacity = Math.max(0.15, 0.5 - branch.depth * 0.05);
          
          return (
            <line
              key={i}
              x1={branch.x1}
              y1={branch.y1}
              x2={branch.x2}
              y2={branch.y2}
              stroke={branch.color === 'gold' ? gold : silver}
              strokeWidth={branch.thickness}
              strokeLinecap="round"
              opacity={opacity}
              strokeDasharray={pathLength}
              strokeDashoffset={mounted ? 0 : pathLength}
              style={{
                transition: `stroke-dashoffset 0.8s ease-out ${branch.delay}s`,
              }}
            />
          );
        })}
        
        {/* Nodes at major branch points (depth 0, 2, 4) */}
        {branches
          .filter(b => b.depth % 2 === 0 && b.depth < 5)
          .map((branch, i) => {
            const nodeOpacity = 0.4 - branch.depth * 0.08;
            const nodeSize = Math.max(2, 4 - branch.depth * 0.5);
            
            return (
              <circle
                key={`node-${i}`}
                cx={branch.x2}
                cy={branch.y2}
                r={nodeSize}
                fill={branch.color === 'gold' ? gold : silver}
                opacity={mounted ? nodeOpacity : 0}
                style={{
                  transition: `opacity 0.5s ease-out ${branch.delay + 0.3}s`,
                }}
              />
            );
          })}
      </svg>
    </div>
  );
}
