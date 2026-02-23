"use client";

// Subtle texture for the whole site — uses CSS noise pattern instead of SVG filter
// for better scroll performance (no feTurbulence re-rasterization)
export default function BackgroundTextures() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ willChange: "transform" }}
    >
      {/* Noise texture — tiny repeating PNG-like pattern via CSS gradient */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-conic-gradient(rgba(0,0,0,0.08) 0% 25%, transparent 0% 50%)
          `,
          backgroundSize: '4px 4px',
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
