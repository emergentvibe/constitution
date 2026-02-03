"use client";

import { useEffect, useState } from "react";

// Animated path component with grow-in effect
function AnimatedPath({ 
  d, 
  stroke, 
  strokeWidth, 
  delay = 0,
  duration = 3,
  opacity = 0.6 
}: { 
  d: string; 
  stroke: string; 
  strokeWidth: number;
  delay?: number;
  duration?: number;
  opacity?: number;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Estimate path length (rough, works for our purposes)
  const pathLength = 300;

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      opacity={opacity}
      strokeDasharray={pathLength}
      strokeDashoffset={mounted ? 0 : pathLength}
      style={{
        transition: `stroke-dashoffset ${duration}s ease-out ${delay}s, opacity 2s ease-out ${delay}s`,
      }}
    />
  );
}

// Pulsing node component
function PulsingNode({
  cx,
  cy,
  r,
  fill,
  delay = 0
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  delay?: number;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      className="animate-pulse"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '4s',
      }}
    />
  );
}

export default function BackgroundTextures() {
  const gold = "#C9A227";
  const silver = "#7B9BAD";

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gradient wash */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(201,162,39,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(123,155,173,0.08) 0%, transparent 50%)',
        }}
      />
      
      {/* Vein network SVG */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === GOLD VEINS === */}
        
        {/* Top-left corner - main branch */}
        <AnimatedPath d="M 0 0 Q 100 50 180 120" stroke={gold} strokeWidth={3} delay={0} duration={2.5} opacity={0.5} />
        <AnimatedPath d="M 180 120 Q 240 160 280 220" stroke={gold} strokeWidth={2.5} delay={0.5} duration={2} opacity={0.4} />
        <AnimatedPath d="M 280 220 Q 320 280 340 350" stroke={gold} strokeWidth={2} delay={1} duration={1.8} opacity={0.3} />
        <AnimatedPath d="M 340 350 Q 360 420 370 500" stroke={gold} strokeWidth={1.5} delay={1.5} duration={1.5} opacity={0.25} />
        
        {/* Top-left - secondary branch */}
        <AnimatedPath d="M 0 0 Q 60 80 90 150" stroke={gold} strokeWidth={2.5} delay={0.3} duration={2} opacity={0.45} />
        <AnimatedPath d="M 90 150 Q 110 220 120 300" stroke={gold} strokeWidth={2} delay={0.8} duration={1.8} opacity={0.35} />
        <AnimatedPath d="M 120 300 Q 130 380 125 460" stroke={gold} strokeWidth={1.5} delay={1.3} duration={1.5} opacity={0.25} />
        
        {/* Top-left - tertiary branch */}
        <AnimatedPath d="M 180 120 Q 220 100 280 90" stroke={gold} strokeWidth={2} delay={0.7} duration={1.5} opacity={0.35} />
        <AnimatedPath d="M 280 90 Q 350 80 420 95" stroke={gold} strokeWidth={1.5} delay={1.2} duration={1.3} opacity={0.25} />
        
        {/* Bottom-right corner - main branch */}
        <AnimatedPath d="M 1920 1080 Q 1820 1030 1740 960" stroke={gold} strokeWidth={3} delay={0.2} duration={2.5} opacity={0.5} />
        <AnimatedPath d="M 1740 960 Q 1680 900 1640 820" stroke={gold} strokeWidth={2.5} delay={0.7} duration={2} opacity={0.4} />
        <AnimatedPath d="M 1640 820 Q 1600 740 1580 660" stroke={gold} strokeWidth={2} delay={1.2} duration={1.8} opacity={0.3} />
        <AnimatedPath d="M 1580 660 Q 1560 580 1560 500" stroke={gold} strokeWidth={1.5} delay={1.7} duration={1.5} opacity={0.25} />
        
        {/* Bottom-right - secondary */}
        <AnimatedPath d="M 1920 1080 Q 1860 1000 1830 920" stroke={gold} strokeWidth={2.5} delay={0.5} duration={2} opacity={0.45} />
        <AnimatedPath d="M 1830 920 Q 1810 840 1800 760" stroke={gold} strokeWidth={2} delay={1} duration={1.8} opacity={0.35} />
        
        {/* Left edge - mid */}
        <AnimatedPath d="M 0 400 Q 80 420 140 460" stroke={gold} strokeWidth={2.5} delay={1} duration={2} opacity={0.4} />
        <AnimatedPath d="M 140 460 Q 200 500 240 560" stroke={gold} strokeWidth={2} delay={1.5} duration={1.8} opacity={0.3} />
        <AnimatedPath d="M 240 560 Q 280 620 300 700" stroke={gold} strokeWidth={1.5} delay={2} duration={1.5} opacity={0.25} />
        
        {/* Top edge - mid */}
        <AnimatedPath d="M 700 0 Q 720 80 760 140" stroke={gold} strokeWidth={2} delay={0.8} duration={1.8} opacity={0.35} />
        <AnimatedPath d="M 760 140 Q 800 200 860 240" stroke={gold} strokeWidth={1.5} delay={1.3} duration={1.5} opacity={0.25} />
        
        {/* Right edge - lower */}
        <AnimatedPath d="M 1920 700 Q 1840 720 1780 760" stroke={gold} strokeWidth={2.5} delay={1.2} duration={2} opacity={0.4} />
        <AnimatedPath d="M 1780 760 Q 1720 800 1680 860" stroke={gold} strokeWidth={2} delay={1.7} duration={1.8} opacity={0.3} />

        {/* === SILVER VEINS === */}
        
        {/* Top-right corner - main branch */}
        <AnimatedPath d="M 1920 0 Q 1820 50 1740 120" stroke={silver} strokeWidth={3} delay={0.1} duration={2.5} opacity={0.5} />
        <AnimatedPath d="M 1740 120 Q 1680 160 1640 220" stroke={silver} strokeWidth={2.5} delay={0.6} duration={2} opacity={0.4} />
        <AnimatedPath d="M 1640 220 Q 1600 280 1580 350" stroke={silver} strokeWidth={2} delay={1.1} duration={1.8} opacity={0.3} />
        <AnimatedPath d="M 1580 350 Q 1560 420 1550 500" stroke={silver} strokeWidth={1.5} delay={1.6} duration={1.5} opacity={0.25} />
        
        {/* Top-right - secondary */}
        <AnimatedPath d="M 1920 0 Q 1860 80 1830 150" stroke={silver} strokeWidth={2.5} delay={0.4} duration={2} opacity={0.45} />
        <AnimatedPath d="M 1830 150 Q 1810 220 1800 300" stroke={silver} strokeWidth={2} delay={0.9} duration={1.8} opacity={0.35} />
        
        {/* Top-right - tertiary */}
        <AnimatedPath d="M 1740 120 Q 1700 100 1640 90" stroke={silver} strokeWidth={2} delay={0.8} duration={1.5} opacity={0.35} />
        <AnimatedPath d="M 1640 90 Q 1570 80 1500 95" stroke={silver} strokeWidth={1.5} delay={1.3} duration={1.3} opacity={0.25} />
        
        {/* Bottom-left corner - main branch */}
        <AnimatedPath d="M 0 1080 Q 100 1030 180 960" stroke={silver} strokeWidth={3} delay={0.15} duration={2.5} opacity={0.5} />
        <AnimatedPath d="M 180 960 Q 240 900 280 820" stroke={silver} strokeWidth={2.5} delay={0.65} duration={2} opacity={0.4} />
        <AnimatedPath d="M 280 820 Q 320 740 340 660" stroke={silver} strokeWidth={2} delay={1.15} duration={1.8} opacity={0.3} />
        <AnimatedPath d="M 340 660 Q 360 580 360 500" stroke={silver} strokeWidth={1.5} delay={1.65} duration={1.5} opacity={0.25} />
        
        {/* Bottom-left - secondary */}
        <AnimatedPath d="M 0 1080 Q 60 1000 90 920" stroke={silver} strokeWidth={2.5} delay={0.45} duration={2} opacity={0.45} />
        <AnimatedPath d="M 90 920 Q 110 840 120 760" stroke={silver} strokeWidth={2} delay={0.95} duration={1.8} opacity={0.35} />
        
        {/* Right edge - upper */}
        <AnimatedPath d="M 1920 380 Q 1840 400 1780 440" stroke={silver} strokeWidth={2.5} delay={1.1} duration={2} opacity={0.4} />
        <AnimatedPath d="M 1780 440 Q 1720 480 1680 540" stroke={silver} strokeWidth={2} delay={1.6} duration={1.8} opacity={0.3} />
        
        {/* Left edge - lower */}
        <AnimatedPath d="M 0 720 Q 80 740 140 780" stroke={silver} strokeWidth={2.5} delay={0.9} duration={2} opacity={0.4} />
        <AnimatedPath d="M 140 780 Q 200 820 240 880" stroke={silver} strokeWidth={2} delay={1.4} duration={1.8} opacity={0.3} />
        
        {/* Bottom edge - mid */}
        <AnimatedPath d="M 1200 1080 Q 1180 1000 1140 940" stroke={silver} strokeWidth={2} delay={0.7} duration={1.8} opacity={0.35} />
        <AnimatedPath d="M 1140 940 Q 1100 880 1040 840" stroke={silver} strokeWidth={1.5} delay={1.2} duration={1.5} opacity={0.25} />
        
        {/* === NODES === */}
        <PulsingNode cx={180} cy={120} r={5} fill={gold} delay={0.5} />
        <PulsingNode cx={280} cy={220} r={4} fill={gold} delay={1} />
        <PulsingNode cx={340} cy={350} r={3} fill={gold} delay={1.5} />
        
        <PulsingNode cx={1740} cy={120} r={5} fill={silver} delay={0.6} />
        <PulsingNode cx={1640} cy={220} r={4} fill={silver} delay={1.1} />
        <PulsingNode cx={1580} cy={350} r={3} fill={silver} delay={1.6} />
        
        <PulsingNode cx={180} cy={960} r={5} fill={silver} delay={0.65} />
        <PulsingNode cx={280} cy={820} r={4} fill={silver} delay={1.15} />
        
        <PulsingNode cx={1740} cy={960} r={5} fill={gold} delay={0.7} />
        <PulsingNode cx={1640} cy={820} r={4} fill={gold} delay={1.2} />
        
        <PulsingNode cx={140} cy={460} r={4} fill={gold} delay={1.5} />
        <PulsingNode cx={1780} cy={440} r={4} fill={silver} delay={1.6} />
        <PulsingNode cx={140} cy={780} r={4} fill={silver} delay={1.4} />
        <PulsingNode cx={1780} cy={760} r={4} fill={gold} delay={1.7} />
      </svg>
    </div>
  );
}
