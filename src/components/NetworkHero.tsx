"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
  colorIdx: number;
}

// Pre-computed color palette (gold to silver, 20 steps)
const PALETTE: { line: string; dot: string; glow: string }[] = [];
const gold = { r: 201, g: 162, b: 39 };
const silver = { r: 123, g: 155, b: 173 };

for (let i = 0; i < 20; i++) {
  const mix = i / 19;
  const r = Math.round(gold.r * (1 - mix) + silver.r * mix);
  const g = Math.round(gold.g * (1 - mix) + silver.g * mix);
  const b = Math.round(gold.b * (1 - mix) + silver.b * mix);
  PALETTE.push({
    line: `rgba(${r}, ${g}, ${b}, 0.35)`,
    dot: `rgba(${r}, ${g}, ${b}, 0.5)`,
    glow: `rgba(${r}, ${g}, ${b}, 0.15)`,
  });
}

// Spatial grid for O(n) neighbor lookup - using numeric keys to avoid string allocation
const CELL_SIZE = 100;
const GRID_COLS = 50; // Max columns for key calculation

function cellKey(cellX: number, cellY: number): number {
  return cellY * GRID_COLS + cellX;
}

function buildGrid(particles: Particle[]): Map<number, number[]> {
  const grid = new Map<number, number[]>();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const key = cellKey(Math.floor(p.x / CELL_SIZE), Math.floor(p.y / CELL_SIZE));
    let cell = grid.get(key);
    if (!cell) {
      cell = [];
      grid.set(key, cell);
    }
    cell.push(i);
  }
  return grid;
}

// Reusable array to avoid allocation
const neighborBuffer: number[] = [];

function getNeighborIndices(p: Particle, idx: number, grid: Map<number, number[]>): number[] {
  const cellX = Math.floor(p.x / CELL_SIZE);
  const cellY = Math.floor(p.y / CELL_SIZE);
  neighborBuffer.length = 0;
  
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const cell = grid.get(cellKey(cellX + dx, cellY + dy));
      if (cell) {
        for (let k = 0; k < cell.length; k++) {
          if (cell[k] > idx) neighborBuffer.push(cell[k]);
        }
      }
    }
  }
  return neighborBuffer;
}

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const frameRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      if (width === 0 || height === 0) return;
      
      const dpr = Math.min(window.devicePixelRatio, 2);
      dprRef.current = dpr;
      
      // Reset transform before setting canvas size
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      const oldWidth = dimensionsRef.current.width;
      const oldHeight = dimensionsRef.current.height;
      dimensionsRef.current = { width, height };
      
      // Initialize or rescale particles
      if (particlesRef.current.length === 0) {
        initParticles(width, height);
        console.log(`Initialized ${particlesRef.current.length} particles in ${width}x${height}`);
      } else if (oldWidth > 0 && oldHeight > 0) {
        // Rescale existing particles
        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;
        for (const p of particlesRef.current) {
          p.x *= scaleX;
          p.y *= scaleY;
        }
      }
    };

    const initParticles = (width: number, height: number) => {
      const particles: Particle[] = [];
      const count = 300;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          seed: Math.random() * 100,
          colorIdx: Math.floor((x / width) * 19),
        });
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      frameRef.current++;
      timeRef.current += 0.016;
      const t = timeRef.current;
      const particles = particlesRef.current;

      // Clear with fade
      ctx.fillStyle = "rgba(250, 247, 242, 0.12)";
      ctx.fillRect(0, 0, width, height);

      // Build spatial grid
      const grid = buildGrid(particles);

      // Update physics (60fps)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Flow field - organic with per-particle variation
        const angle = (
          Math.sin(p.x * 0.012 + t * 0.08 + p.seed) +
          Math.sin(p.y * 0.010 - t * 0.06 + p.seed * 0.7) +
          Math.sin((p.x + p.y) * 0.008 + t * 0.1)
        ) * Math.PI * 0.5;
        const flowX = Math.cos(angle) * 0.06;
        const flowY = Math.sin(angle) * 0.06;

        // Divergence for attract/repel - slower changing
        const div = Math.sin(p.x * 0.004 + t * 0.04) + Math.sin(p.y * 0.005 - t * 0.03);
        
        // Neighbor interaction using spatial grid
        let forceX = 0, forceY = 0;
        const neighborIndices = getNeighborIndices(p, i, grid);
        
        for (let k = 0; k < neighborIndices.length; k++) {
          const other = particles[neighborIndices[k]];
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 5000 && distSq > 4) { // ~70px interaction radius
            const dist = Math.sqrt(distSq);
            const strength = (70 - dist) / 70;
            const factor = strength * 0.0015;
            
            if (div < 0) {
              forceX += (dx / dist) * factor;
              forceY += (dy / dist) * factor;
            } else {
              forceX -= (dx / dist) * factor;
              forceY -= (dy / dist) * factor;
            }
          }
        }

        p.vx = p.vx * 0.96 + flowX + forceX;
        p.vy = p.vy * 0.96 + flowY + forceY;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;
        
        // Update color index
        p.colorIdx = Math.min(19, Math.max(0, Math.floor((p.x / width) * 20)));
      }

      // Draw connections using spatial grid
      const connectionDistSq = 90 * 90; // 90px
      ctx.lineCap = "round";
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const neighbors = getNeighborIndices(p1, i, grid);
        
        for (const j of neighbors) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const strength = 1 - dist / 90;
            
            ctx.strokeStyle = PALETTE[p1.colorIdx].line;
            ctx.globalAlpha = strength * strength;
            ctx.lineWidth = strength * 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;

      // Draw particles
      for (const p of particles) {
        const colors = PALETTE[p.colorIdx];
        
        // Glow
        ctx.fillStyle = colors.glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = colors.dot;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    const retryTimeout = setTimeout(resize, 100);
    
    window.addEventListener("resize", resize);
    
    // Handle zoom changes (including pinch zoom on mobile)
    let lastDpr = window.devicePixelRatio;
    const checkZoom = () => {
      if (window.devicePixelRatio !== lastDpr) {
        lastDpr = window.devicePixelRatio;
        resize();
      }
    };
    const zoomInterval = setInterval(checkZoom, 500);
    
    // Visual viewport resize (mobile pinch zoom)
    const visualViewportHandler = () => resize();
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", visualViewportHandler);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(retryTimeout);
      clearInterval(zoomInterval);
      window.removeEventListener("resize", resize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", visualViewportHandler);
      }
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
