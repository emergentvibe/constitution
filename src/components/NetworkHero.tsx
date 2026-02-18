"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
}

// Noise function for organic patterns
function noise(x: number, y: number, t: number, seed: number = 0): number {
  return (
    Math.sin(x * 0.008 + t * 0.15 + seed) * 0.4 +
    Math.sin(y * 0.009 - t * 0.12 + seed * 1.3) * 0.4 +
    Math.sin((x - y) * 0.012 + t * 0.18 + seed * 0.7) * 0.35 +
    Math.sin((x + y) * 0.006 - t * 0.08) * 0.25 +
    Math.sin(x * 0.015 - y * 0.018 - t * 0.1) * 0.2
  );
}

// Flow field - direction of movement
function getFlow(x: number, y: number, t: number, seed: number): { vx: number; vy: number } {
  const angle = noise(x, y, t * 0.3, seed) * Math.PI * 2;
  const magnitude = 0.06 + Math.abs(noise(x * 0.8, y * 0.8, t * 0.3 + 100, seed)) * 0.04;
  return {
    vx: Math.cos(angle) * magnitude,
    vy: Math.sin(angle) * magnitude,
  };
}

// Divergence field - controls attraction vs repulsion
// Negative = converge (attract), Positive = diverge (repel)
function getDivergence(x: number, y: number, t: number): number {
  // Slower-changing field for smooth transitions
  return (
    Math.sin(x * 0.004 + t * 0.05) * 0.5 +
    Math.sin(y * 0.005 - t * 0.04) * 0.5 +
    Math.sin((x + y) * 0.003 + t * 0.06) * 0.4
  );
}

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dimensionsRef.current = { width: rect.width, height: rect.height };
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(rect.width, rect.height);
    };

    const initParticles = (width: number, height: number) => {
      const particles: Particle[] = [];
      const count = 80; // Reduced for performance

      for (let i = 0; i < count; i++) {
        // Bias toward bottom-left quadrant for asymmetric density
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
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          seed: Math.random() * 50,
        });
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      if (width === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = 0.016;
      timeRef.current += dt;
      const t = timeRef.current;

      // Clear with fade for subtle trails
      ctx.fillStyle = "rgba(250, 247, 242, 0.12)";
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const connectionDist = 150;
      const interactionDist = 80;
      const gold = { r: 201, g: 162, b: 39 };
      const silver = { r: 123, g: 155, b: 173 };

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Get flow at current position
        const flow = getFlow(p.x, p.y, t, p.seed);
        
        // Get divergence - controls attract/repel behavior
        const div = getDivergence(p.x, p.y, t);
        
        // Calculate interaction forces based on divergence
        let forceX = 0;
        let forceY = 0;
        
        for (let j = 0; j < particles.length; j++) {
          if (i === j) continue;
          const other = particles[j];
          
          let dx = other.x - p.x;
          let dy = other.y - p.y;
          
          // Toroidal distance (wrap around)
          if (dx > width / 2) dx -= width;
          if (dx < -width / 2) dx += width;
          if (dy > height / 2) dy -= height;
          if (dy < -height / 2) dy += height;
          
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < interactionDist && dist > 0) {
            const strength = (interactionDist - dist) / interactionDist;
            
            if (div < 0) {
              // Converging zone - attract
              const attractStrength = Math.abs(div) * 0.0008 * strength;
              forceX += (dx / dist) * attractStrength;
              forceY += (dy / dist) * attractStrength;
            } else {
              // Diverging zone - repel
              const repelStrength = div * 0.001 * strength;
              forceX -= (dx / dist) * repelStrength;
              forceY -= (dy / dist) * repelStrength;
            }
          }
        }

        // Apply forces: flow (dominant) + interaction
        p.vx = p.vx * 0.96 + flow.vx * 0.8 + forceX;
        p.vy = p.vy * 0.96 + flow.vy * 0.8 + forceY;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Toroidal wrap (seamless)
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;
      }

      // Draw connections
      ctx.lineCap = "round";
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          let dx = p2.x - p1.x;
          let dy = p2.y - p1.y;
          
          // Toroidal distance for connections too
          if (dx > width / 2) dx -= width;
          if (dx < -width / 2) dx += width;
          if (dy > height / 2) dy -= height;
          if (dy < -height / 2) dy += height;
          
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const strength = 1 - dist / connectionDist;
            const opacity = strength * strength * 0.35;

            const midX = (p1.x + p2.x) / 2;
            const colorMix = midX / width;
            const color = {
              r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
              g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
              b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
            };

            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = strength * 2;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            // Draw to actual position, not wrapped (for visual continuity)
            ctx.lineTo(p1.x + dx, p1.y + dy);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const colorMix = p.x / width;
        const color = {
          r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
          g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
          b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
        };

        // Glow
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.08)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
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
