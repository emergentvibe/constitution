"use client";

export default function BackgroundTextures() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Gradient wash */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, transparent 50%, rgba(123,155,173,0.15) 100%)',
        }}
      />
      
      {/* Vein network SVG */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gold veins from corners and edges */}
        <g stroke="#C9A227" fill="none" strokeLinecap="round">
          {/* Top-left */}
          <path d="M 0 0 Q 80 40 120 80" strokeWidth="3" opacity="0.6"/>
          <path d="M 0 0 Q 40 60 60 120" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 120 80 Q 160 100 180 140" strokeWidth="2" opacity="0.4"/>
          
          {/* Bottom-right */}
          <path d="M 1920 1080 Q 1840 1040 1800 1000" strokeWidth="3" opacity="0.6"/>
          <path d="M 1920 1080 Q 1880 1020 1860 960" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 1800 1000 Q 1760 980 1740 940" strokeWidth="2" opacity="0.4"/>
          
          {/* Left edge mid */}
          <path d="M 0 400 Q 60 420 100 450" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 100 450 Q 140 470 160 510" strokeWidth="2" opacity="0.4"/>
          
          {/* Right edge mid */}
          <path d="M 1920 700 Q 1860 720 1820 750" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 1820 750 Q 1780 770 1760 810" strokeWidth="2" opacity="0.4"/>
          
          {/* Top mid */}
          <path d="M 600 0 Q 620 60 640 100" strokeWidth="2" opacity="0.4"/>
          <path d="M 640 100 Q 660 130 700 150" strokeWidth="1.5" opacity="0.3"/>
        </g>
        
        {/* Silver veins */}
        <g stroke="#7B9BAD" fill="none" strokeLinecap="round">
          {/* Top-right */}
          <path d="M 1920 0 Q 1840 40 1800 80" strokeWidth="3" opacity="0.6"/>
          <path d="M 1920 0 Q 1880 60 1860 120" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 1800 80 Q 1760 100 1740 140" strokeWidth="2" opacity="0.4"/>
          
          {/* Bottom-left */}
          <path d="M 0 1080 Q 80 1040 120 1000" strokeWidth="3" opacity="0.6"/>
          <path d="M 0 1080 Q 40 1020 60 960" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 120 1000 Q 160 980 180 940" strokeWidth="2" opacity="0.4"/>
          
          {/* Left edge lower */}
          <path d="M 0 700 Q 60 720 100 750" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 100 750 Q 140 770 160 810" strokeWidth="2" opacity="0.4"/>
          
          {/* Right edge upper */}
          <path d="M 1920 400 Q 1860 420 1820 450" strokeWidth="2.5" opacity="0.5"/>
          <path d="M 1820 450 Q 1780 470 1760 510" strokeWidth="2" opacity="0.4"/>
          
          {/* Bottom mid */}
          <path d="M 1300 1080 Q 1280 1020 1260 980" strokeWidth="2" opacity="0.4"/>
          <path d="M 1260 980 Q 1240 950 1200 930" strokeWidth="1.5" opacity="0.3"/>
        </g>
        
        {/* Nodes at intersections */}
        <g>
          <circle cx="120" cy="80" r="4" fill="#C9A227" opacity="0.5"/>
          <circle cx="1800" cy="80" r="4" fill="#7B9BAD" opacity="0.5"/>
          <circle cx="120" cy="1000" r="4" fill="#7B9BAD" opacity="0.5"/>
          <circle cx="1800" cy="1000" r="4" fill="#C9A227" opacity="0.5"/>
          <circle cx="100" cy="450" r="3" fill="#C9A227" opacity="0.4"/>
          <circle cx="1820" cy="450" r="3" fill="#7B9BAD" opacity="0.4"/>
          <circle cx="100" cy="750" r="3" fill="#7B9BAD" opacity="0.4"/>
          <circle cx="1820" cy="750" r="3" fill="#C9A227" opacity="0.4"/>
        </g>
      </svg>
    </div>
  );
}
