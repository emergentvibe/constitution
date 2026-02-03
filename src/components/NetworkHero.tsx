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
    const generateSpotlights = (width: number, height: number) => {
      spotlightsRef.current = [
        {
          x: width * 0.2,
          y: height * 0.3,
          baseX: width * 0.2,
          baseY: height * 0.3,
          radius: 180,
          phase: 0,
          speed: 0.3,
          breatheAmplitudeX: width * 0.15,
          breatheAmplitudeY: height * 0.1,
        },
        {
          x: width * 0.8,
          y: height * 0.6,
          baseX: width * 0.8,
          baseY: height * 0.6,
          radius: 150,
          phase: Math.PI * 0.7,
          speed: 0.25,
          breatheAmplitudeX: width * 0.12,
          breatheAmplitudeY: height * 0.15,
        },
        {
          x: width * 0.5,
          y: height * 0.5,
          baseX: width * 0.5,
          baseY: height * 0.5,
          radius: 200,
          phase: Math.PI * 1.3,
          speed: 0.2,
          breatheAmplitudeX: width * 0.2,
          breatheAmplitudeY: height * 0.12,
        },
      ];
    };

    // Calculate brightness based on spotlight distance
    const getBrightness = (x: number, y: number): number => {
      let brightness = 0;
      
      for (const spotlight of spotlightsRef.current) {
        const dist = Math.sqrt(
          Math.pow(x - spotlight.x, 2) +
          Math.pow(y - spotlight.y, 2)
        );
        
        if (dist < spotlight.radius) {
          // Smooth falloff
          const falloff = 1 - (dist / spotlight.radius);
          brightness += falloff * falloff; // quadratic for smoother edges
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
        
        // Also breathe the radius
        spotlight.radius = 150 + Math.sin(t * 0.5 + spotlight.phase) * 50;
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
            
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness * 0.4})`;
            ctx.lineWidth = 1 + brightness;
            
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
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness * 0.2})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6 + brightness * 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness * 0.6})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2 + brightness * 2, 0, Math.PI * 2);
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
