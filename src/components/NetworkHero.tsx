"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
  colorIdx: number; // Pre-computed color index
}

// Pre-computed color palette (gold to silver gradient, 10 steps)
const COLORS: string[] = [];
const COLORS_FAINT: string[] = [];
const gold = { r: 201, g: 162, b: 39 };
const silver = { r: 123, g: 155, b: 173 };
for (let i = 0; i < 10; i++) {
  const mix = i / 9;
  const r = Math.round(gold.r * (1 - mix) + silver.r * mix);
  const g = Math.round(gold.g * (1 - mix) + silver.g * mix);
  const b = Math.round(gold.b * (1 - mix) + silver.b * mix);
  COLORS.push(`rgba(${r}, ${g}, ${b}, 0.25)`);
  COLORS_FAINT.push(`rgba(${r}, ${g}, ${b}, 0.08)`);
}

// Simplified noise - fewer sin calls
function noise(x: number, y: number, t: number, seed: number = 0): number {
  return (
    Math.sin(x * 0.01 + t * 0.1 + seed) * 0.5 +
    Math.sin(y * 0.01 - t * 0.08 + seed * 1.3) * 0.5
  );
}

// Divergence field - controls attraction vs repulsion
function getDivergence(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.004 + t * 0.05) * 0.5 +
    Math.sin(y * 0.005 - t * 0.04) * 0.5
  );
}

// Spatial grid cell size
const CELL_SIZE = 100;

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const frameRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const gridRef = useRef<Map<string, number[]>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dimensionsRef.current = { width: rect.width, height: rect.height };
      // Use lower resolution for performance
      const scale = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);
      initParticles(rect.width, rect.height);
    };

    const initParticles = (width: number, height: number) => {
      const particles: Particle[] = [];
      const count = 180; // More bodies!

      for (let i = 0; i < count; i++) {
        let x, y;
        if (Math.random() < 0.6) {
          x = Math.random() * width * 0.7;
          y = height * 0.3 + Math.random() * height * 0.7;
        } else {
          x = Math.random() * width;
          y = Math.random() * height;
        }
        
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          seed: Math.random() * 50,
          colorIdx: Math.floor(Math.random() * 10),
        });
      }

      particlesRef.current = particles;
    };

    // Build spatial grid
    const buildGrid = (particles: Particle[], width: number, height: number) => {
      const grid = new Map<string, number[]>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cellX = Math.floor(p.x / CELL_SIZE);
        const cellY = Math.floor(p.y / CELL_SIZE);
        const key = `${cellX},${cellY}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      }
      return grid;
    };

    // Get neighbor indices from grid
    const getNeighbors = (p: Particle, grid: Map<string, number[]>): number[] => {
      const cellX = Math.floor(p.x / CELL_SIZE);
      const cellY = Math.floor(p.y / CELL_SIZE);
      const neighbors: number[] = [];
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cellX + dx},${cellY + dy}`;
          const cell = grid.get(key);
          if (cell) neighbors.push(...cell);
        }
      }
      return neighbors;
    };

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      if (width === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      frameRef.current++;
      const frame = frameRef.current;
      
      // Physics at 30fps (every other frame)
      const doPhysics = frame % 2 === 0;
      
      if (doPhysics) {
        timeRef.current += 0.032;
      }
      const t = timeRef.current;

      // Clear
      ctx.fillStyle = "#FAF7F2";
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      const particles = particlesRef.current;
      const connectionDist = 120;

      // Build spatial grid (needed for both physics and drawing)
      const grid = buildGrid(particles, width, height);

      // Update physics (every other frame)
      if (doPhysics) {
        const interactionDist = 60;
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          // Flow field
          const angle = noise(p.x, p.y, t, p.seed) * Math.PI * 2;
          const flowX = Math.cos(angle) * 0.06;
          const flowY = Math.sin(angle) * 0.06;

          // Interaction forces (using spatial grid - only check neighbors)
          let forceX = 0;
          let forceY = 0;
          const div = getDivergence(p.x, p.y, t);
          const neighbors = getNeighbors(p, grid);
          
          for (const j of neighbors) {
            if (j === i) continue;
            const other = particles[j];
            
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < interactionDist * interactionDist && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const strength = (interactionDist - dist) / interactionDist;
              
              if (div < 0) {
                // Converging zone - attract
                const attractStrength = Math.abs(div) * 0.0015 * strength;
                forceX += (dx / dist) * attractStrength;
                forceY += (dy / dist) * attractStrength;
              } else {
                // Diverging zone - repel
                const repelStrength = div * 0.002 * strength;
                forceX -= (dx / dist) * repelStrength;
                forceY -= (dy / dist) * repelStrength;
              }
            }
          }

          p.vx = p.vx * 0.94 + flowX + forceX;
          p.vy = p.vy * 0.94 + flowY + forceY;

          p.x += p.vx;
          p.y += p.vy;

          // Wrap
          if (p.x < 0) p.x += width;
          if (p.x > width) p.x -= width;
          if (p.y < 0) p.y += height;
          if (p.y > height) p.y -= height;
          
          // Update color based on position
          p.colorIdx = Math.min(9, Math.floor((p.x / width) * 10));
        }
      }

      // Batch lines by color index
      const lineBatches: { x1: number; y1: number; x2: number; y2: number; colorIdx: number }[] = [];

      // Draw connections using spatial grid
      ctx.lineCap = "round";
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const neighbors = getNeighbors(p1, grid);
        
        for (const j of neighbors) {
          if (j <= i) continue; // Avoid duplicates
          const p2 = particles[j];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDist * connectionDist) {
            const dist = Math.sqrt(distSq);
            const strength = 1 - dist / connectionDist;
            
            ctx.strokeStyle = COLORS[p1.colorIdx];
            ctx.globalAlpha = strength * strength * 0.4;
            ctx.lineWidth = strength * 1.5;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // Draw particles (batched by color)
      for (let colorIdx = 0; colorIdx < 10; colorIdx++) {
        // Glow pass
        ctx.fillStyle = COLORS_FAINT[colorIdx];
        ctx.beginPath();
        for (const p of particles) {
          if (p.colorIdx === colorIdx) {
            ctx.moveTo(p.x + 4, p.y);
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        // Core pass
        ctx.fillStyle = COLORS[colorIdx];
        ctx.beginPath();
        for (const p of particles) {
          if (p.colorIdx === colorIdx) {
            ctx.moveTo(p.x + 2, p.y);
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          }
        }
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
      style={{ filter: "blur(0.5px)" }}
    />
  );
}
