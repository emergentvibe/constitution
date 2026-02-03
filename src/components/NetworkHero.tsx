"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  connections: number[];
}

interface Spotlight {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  baseRadius: number;
  intensity: number; // inverse of size - small = bright, big = dim
  phase: number;
  speed: number;
  breatheAmplitudeX: number;
  breatheAmplitudeY: number;
}

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const spotlightsRef = useRef<Spotlight[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Regenerate network on resize
      generateNetwork(rect.width, rect.height);
      generateSpotlights(rect.width, rect.height);
    };

    // Generate network of nodes
    const generateNetwork = (width: number, height: number) => {
      const nodes: Node[] = [];
      const nodeCount = 120;
      const connectionDistance = 100;

      // Create nodes in a semi-random grid
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          connections: [],
        });
      }

      // Connect nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) +
            Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          if (dist < connectionDistance) {
            nodes[i].connections.push(j);
          }
        }
      }

      nodesRef.current = nodes;
    };

    // Generate spotlights with breathing patterns
    // Mix of sizes: large (dim), medium, small (bright)
    // Size ratio ~10:1 from biggest to smallest
    const generateSpotlights = (width: number, height: number) => {
      const spotlights: Spotlight[] = [];
      
      // Large spotlights (radius 300-400, intensity 0.6-0.8) - 3 of them
      const largeConfigs = [
        { bx: 0.15, by: 0.3 },
        { bx: 0.85, by: 0.7 },
        { bx: 0.5, by: 0.2 },
      ];
      largeConfigs.forEach((cfg) => {
        spotlights.push({
          x: width * cfg.bx,
          y: height * cfg.by,
          baseX: width * cfg.bx,
          baseY: height * cfg.by,
          radius: 350 + Math.random() * 50,
          baseRadius: 350 + Math.random() * 50,
          intensity: 0.6 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.1,
          breatheAmplitudeX: width * (0.15 + Math.random() * 0.1),
          breatheAmplitudeY: height * (0.1 + Math.random() * 0.1),
        });
      });
      
      // Medium spotlights (radius 120-200, intensity 1.0-1.4) - 5 of them
      const mediumConfigs = [
        { bx: 0.3, by: 0.6 },
        { bx: 0.7, by: 0.4 },
        { bx: 0.2, by: 0.8 },
        { bx: 0.8, by: 0.2 },
        { bx: 0.5, by: 0.7 },
      ];
      mediumConfigs.forEach((cfg) => {
        spotlights.push({
          x: width * cfg.bx,
          y: height * cfg.by,
          baseX: width * cfg.bx,
          baseY: height * cfg.by,
          radius: 120 + Math.random() * 80,
          baseRadius: 120 + Math.random() * 80,
          intensity: 1.0 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.15,
          breatheAmplitudeX: width * (0.08 + Math.random() * 0.08),
          breatheAmplitudeY: height * (0.06 + Math.random() * 0.08),
        });
      });
      
      // Small spotlights (radius 40-80, intensity 1.5-2.0) - 7 of them
      const smallConfigs = [
        { bx: 0.1, by: 0.5 },
        { bx: 0.9, by: 0.5 },
        { bx: 0.4, by: 0.3 },
        { bx: 0.6, by: 0.8 },
        { bx: 0.25, by: 0.15 },
        { bx: 0.75, by: 0.85 },
        { bx: 0.5, by: 0.45 },
      ];
      smallConfigs.forEach((cfg) => {
        spotlights.push({
          x: width * cfg.bx,
          y: height * cfg.by,
          baseX: width * cfg.bx,
          baseY: height * cfg.by,
          radius: 40 + Math.random() * 40,
          baseRadius: 40 + Math.random() * 40,
          intensity: 1.5 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.2,
          breatheAmplitudeX: width * (0.04 + Math.random() * 0.06),
          breatheAmplitudeY: height * (0.03 + Math.random() * 0.06),
        });
      });
      
      spotlightsRef.current = spotlights;
    };

    // Calculate brightness based on spotlight distance and intensity
    const getBrightness = (x: number, y: number): number => {
      let brightness = 0;
      
      for (const spotlight of spotlightsRef.current) {
        const dist = Math.sqrt(
          Math.pow(x - spotlight.x, 2) +
          Math.pow(y - spotlight.y, 2)
        );
        
        if (dist < spotlight.radius) {
          // Smooth falloff, weighted by intensity
          const falloff = 1 - (dist / spotlight.radius);
          brightness += falloff * falloff * spotlight.intensity;
        }
      }
      
      return Math.min(1, brightness);
    };

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      timeRef.current += 0.016; // ~60fps
      const t = timeRef.current;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Update spotlight positions (breathing pattern)
      for (const spotlight of spotlightsRef.current) {
        spotlight.x = spotlight.baseX + 
          Math.sin(t * spotlight.speed + spotlight.phase) * spotlight.breatheAmplitudeX;
        spotlight.y = spotlight.baseY + 
          Math.cos(t * spotlight.speed * 0.7 + spotlight.phase) * spotlight.breatheAmplitudeY;
        
        // Also breathe the radius (proportional to base size)
        const breatheAmount = spotlight.baseRadius * 0.2;
        spotlight.radius = spotlight.baseRadius + Math.sin(t * 0.4 + spotlight.phase) * breatheAmount;
      }

      const nodes = nodesRef.current;
      const gold = { r: 201, g: 162, b: 39 };
      const silver = { r: 123, g: 155, b: 173 };

      // Draw connections
      ctx.lineCap = "round";
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (const j of node.connections) {
          const other = nodes[j];
          
          // Calculate brightness at midpoint
          const midX = (node.x + other.x) / 2;
          const midY = (node.y + other.y) / 2;
          const brightness = getBrightness(midX, midY);
          
          if (brightness > 0.02) {
            // Mix gold and silver based on position
            const colorMix = (node.x + other.x) / (2 * width);
            const color = {
              r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
              g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
              b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
            };
            
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(0.8, brightness * 0.6)})`;
            ctx.lineWidth = 1 + brightness * 1.5;
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const brightness = getBrightness(node.x, node.y);
        
        if (brightness > 0.02) {
          const colorMix = node.x / width;
          const color = {
            r: Math.round(gold.r * (1 - colorMix) + silver.r * colorMix),
            g: Math.round(gold.g * (1 - colorMix) + silver.g * colorMix),
            b: Math.round(gold.b * (1 - colorMix) + silver.b * colorMix),
          };
          
          // Glow
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(0.5, brightness * 0.35)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8 + brightness * 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(0.9, brightness * 0.8)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5 + brightness * 3, 0, Math.PI * 2);
          ctx.fill();
        }
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
      style={{ opacity: 0.8 }}
    />
  );
}
