"use client";

// Simple gradient background - main visual is NetworkHero
export default function BackgroundTextures() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Subtle gradient wash */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(201,162,39,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(123,155,173,0.03) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
