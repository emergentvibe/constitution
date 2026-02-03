"use client";

// Granite grain texture for the whole site
export default function BackgroundTextures() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Granite grain texture - coarse, stone-like */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle warm/cool gradient */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(201,162,39,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(123,155,173,0.04) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
