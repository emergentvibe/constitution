"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  seed: number; // individual variation
}

// Turbulent noise function with more variation
function noise(x: number, y: number, t: number, seed: number = 0): number {
  // Multiple octaves with different frequencies for more chaos
  return (
    Math.sin(x * 0.008 + t * 0.15 + seed) * 0.4 +
    Math.sin(y * 0.009 - t * 0.12 + seed * 1.3) * 0.4 +
    Math.sin((x - y) * 0.012 + t * 0.18 + seed * 0.7) * 0.35 +
    Math.sin((x + y) * 0.006 - t * 0.08) * 0.25 +
    Math.sin(x * 0.025 + y * 0.02 + t * 0.3 + seed * 2) * 0.3 +
    Math.sin(x * 0.015 - y * 0.018 - t * 0.22) * 0.2
  );
}

// Get flow vector at position with more turbulence
function getFlow(x: number, y: number, t: number, seed: number = 0): { vx: number; vy: number } {
  const angle = noise(x, y, t, seed) * Math.PI * 2.5; // more rotation
  const angle2 = noise(x * 1.3, y * 1.3, t + 50, seed + 10) * Math.PI;
  const combinedAngle = angle + angle2 * 0.3;
  const magnitude = 0.25 + Math.abs(noise(x * 0.8, y * 0.8, t + 100, seed)) * 0.3;
  return {
    vx: Math.cos(combinedAngle) * magnitude,
    vy: Math.sin(combinedAngle) * magnitude,
  };
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
      const count = 120;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5, // start with some velocity
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random(),
          seed: Math.random() * 100, // unique flow variation per particle
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

      // Clear with slight fade for trails
      ctx.fillStyle = "rgba(250, 247, 242, 0.15)";
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const connectionDist = 80;
      const gold = { r: 201, g: 162, b: 39 };
      const silver = { r: 123, g: 155, b: 173 };

      // Update particles
      for (const p of particles) {
        // Get flow at current position (each particle has unique seed)
        const flow = getFlow(p.x, p.y, t, p.seed);

        // Apply flow with inertia + small random nudge for dispersion
        p.vx = p.vx * 0.92 + flow.vx * 0.4 + (Math.random() - 0.5) * 0.05;
        p.vy = p.vy * 0.92 + flow.vy * 0.4 + (Math.random() - 0.5) * 0.05;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges with randomized re-entry
        if (p.x < -20) { p.x = width + 20; p.y = Math.random() * height; }
        if (p.x > width + 20) { p.x = -20; p.y = Math.random() * height; }
        if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
        if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }

        // Slowly cycle life for subtle variation
        p.life = (p.life + dt * 0.1) % 1;
      }

      // Draw connections
      ctx.lineCap = "round";
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const strength = 1 - dist / connectionDist;
            const opacity = strength * strength * 0.25;

            // Color based on position
            const midX = (p1.x + p2.x) / 2;
            const colorMix = midX / width;
            const color = {
              r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
              g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
              b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
            };

            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = strength * 1.5;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
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

        // Subtle glow
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.35)`;
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
