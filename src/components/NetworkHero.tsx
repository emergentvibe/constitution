"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
}

// Pre-computed color palette (gold to silver gradient)
const gold = { r: 201, g: 162, b: 39 };
const silver = { r: 123, g: 155, b: 173 };

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Skip if dimensions are zero (not mounted yet)
      if (width === 0 || height === 0) return;
      
      dimensionsRef.current = { width, height };
      
      // Set canvas size
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // Only initialize particles once
      if (!initializedRef.current) {
        initParticles(width, height);
        initializedRef.current = true;
        console.log(`Initialized ${particlesRef.current.length} particles in ${width}x${height}`);
      }
    };

    const initParticles = (width: number, height: number) => {
      const particles: Particle[] = [];
      const count = 300; // More particles!

      for (let i = 0; i < count; i++) {
        // Even spread across canvas
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          seed: Math.random() * 100,
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

      timeRef.current += 0.016;
      const t = timeRef.current;
      const particles = particlesRef.current;

      // Clear with slight fade for trails
      ctx.fillStyle = "rgba(250, 247, 242, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Update particles
      for (const p of particles) {
        // Flow field
        const angle = Math.sin(p.x * 0.01 + t * 0.1 + p.seed) * Math.PI;
        const flowX = Math.cos(angle) * 0.03;
        const flowY = Math.sin(angle) * 0.03;

        // Divergence field for interaction behavior
        const div = Math.sin(p.x * 0.005 + t * 0.05) + Math.sin(p.y * 0.005 - t * 0.04);
        
        // Simple neighbor interaction (check nearby particles)
        let forceX = 0, forceY = 0;
        for (const other of particles) {
          if (other === p) continue;
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 3600 && distSq > 1) { // 60px radius
            const dist = Math.sqrt(distSq);
            const strength = (60 - dist) / 60;
            
            if (div < 0) {
              // Attract
              forceX += (dx / dist) * strength * 0.001;
              forceY += (dy / dist) * strength * 0.001;
            } else {
              // Repel
              forceX -= (dx / dist) * strength * 0.001;
              forceY -= (dy / dist) * strength * 0.001;
            }
          }
        }

        p.vx = p.vx * 0.95 + flowX + forceX;
        p.vy = p.vy * 0.95 + flowY + forceY;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;
      }

      // Draw connections
      const connectionDist = 100;
      ctx.lineCap = "round";
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDist * connectionDist) {
            const dist = Math.sqrt(distSq);
            const strength = 1 - dist / connectionDist;
            
            // Color based on x position (gold to silver)
            const mix = (p1.x + p2.x) / 2 / width;
            const r = Math.round(gold.r * (1 - mix) + silver.r * mix);
            const g = Math.round(gold.g * (1 - mix) + silver.g * mix);
            const b = Math.round(gold.b * (1 - mix) + silver.b * mix);
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${strength * strength * 0.4})`;
            ctx.lineWidth = strength * 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const mix = p.x / width;
        const r = Math.round(gold.r * (1 - mix) + silver.r * mix);
        const g = Math.round(gold.g * (1 - mix) + silver.g * mix);
        const b = Math.round(gold.b * (1 - mix) + silver.b * mix);
        
        // Glow
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial resize
    resize();
    
    // Retry resize after a moment (in case initial render had zero dimensions)
    const retryTimeout = setTimeout(resize, 100);
    
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(retryTimeout);
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
