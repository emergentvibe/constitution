/**
 * Organic network pattern generator
 * Outputs SVG with branching vein/mycelium structures
 */

const fs = require('fs');

// Config
const WIDTH = 1920;
const HEIGHT = 1080;
const SEED = Date.now(); // change for different patterns

// Seeded random for reproducibility
let seed = SEED;
function random() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randomRange(min, max) {
  return min + random() * (max - min);
}

// Store all paths
const paths = [];
const nodes = [];

/**
 * Recursive branching function
 */
function branch(x, y, angle, depth, thickness, color) {
  if (depth <= 0 || thickness < 0.3) return;
  
  // Organic length variation
  const length = randomRange(30, 80) * (depth / 6);
  
  // End point with slight curve
  const curve = randomRange(-0.2, 0.2);
  const x2 = x + Math.cos(angle + curve) * length;
  const y2 = y + Math.sin(angle + curve) * length;
  
  // Stay in bounds (with margin)
  if (x2 < -100 || x2 > WIDTH + 100 || y2 < -100 || y2 > HEIGHT + 100) return;
  
  // Create curved path (quadratic bezier for organic feel)
  const cx = x + Math.cos(angle + curve * 2) * length * 0.5 + randomRange(-10, 10);
  const cy = y + Math.sin(angle + curve * 2) * length * 0.5 + randomRange(-10, 10);
  
  paths.push({
    d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
    thickness: thickness,
    color: color
  });
  
  // Add node at branch point
  if (depth < 5 && random() > 0.6) {
    nodes.push({ x: x2, y: y2, r: thickness * 1.5, color: color === 'gold' ? 'silver' : 'gold' });
  }
  
  // Continue main branch (slight angle drift)
  const drift = randomRange(-0.3, 0.3);
  branch(x2, y2, angle + drift, depth - 1, thickness * randomRange(0.7, 0.9), color);
  
  // Lower fork chance for sparser pattern
  const forkChance = 0.2 + (5 - depth) * 0.08;
  
  if (random() < forkChance) {
    // Fork right
    const forkAngle = randomRange(0.5, 1.0);
    branch(x2, y2, angle + forkAngle, depth - 1, thickness * randomRange(0.4, 0.6), color);
  }
  
  if (random() < forkChance * 0.5) {
    // Fork left (even rarer)
    const forkAngle = randomRange(0.5, 1.0);
    branch(x2, y2, angle - forkAngle, depth - 1, thickness * randomRange(0.4, 0.6), color);
  }
}

/**
 * Generate from multiple starting points
 */
function generate() {
  // Sparse origins - just corners, fewer branches
  const origins = [
    // Corners only - veins emerge from edges
    { x: 0, y: 0, angle: Math.PI * 0.25, color: 'gold' },
    { x: WIDTH, y: 0, angle: Math.PI * 0.75, color: 'silver' },
    { x: 0, y: HEIGHT, angle: -Math.PI * 0.25, color: 'silver' },
    { x: WIDTH, y: HEIGHT, angle: -Math.PI * 0.75, color: 'gold' },
  ];
  
  origins.forEach(({ x, y, angle, color }) => {
    // Fewer branches, more sparse
    const branchCount = Math.floor(randomRange(1, 3));
    for (let i = 0; i < branchCount; i++) {
      const angleVariation = randomRange(-0.2, 0.2);
      branch(x, y, angle + angleVariation, 5, randomRange(1.5, 2.5), color);
    }
  });
}

/**
 * Render to SVG
 */
function render() {
  const goldColor = '#C9A227';
  const silverColor = '#7B9BAD';
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <!-- Slight blur for organic softness -->
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.5" />
    </filter>
  </defs>
  <g filter="url(#soft)">
`;
  
  // Render paths (thicker ones first for layering)
  paths.sort((a, b) => b.thickness - a.thickness);
  
  paths.forEach(({ d, thickness, color }) => {
    const strokeColor = color === 'gold' ? goldColor : silverColor;
    svg += `    <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${thickness.toFixed(2)}" stroke-linecap="round" opacity="0.8"/>\n`;
  });
  
  // Render nodes
  nodes.forEach(({ x, y, r, color }) => {
    const fillColor = color === 'gold' ? goldColor : silverColor;
    svg += `    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fillColor}" opacity="0.7"/>\n`;
  });
  
  svg += `  </g>\n</svg>`;
  
  return svg;
}

// Run
generate();
const svg = render();

// Output
const outputPath = process.argv[2] || 'public/network-pattern.svg';
fs.writeFileSync(outputPath, svg);

console.log(`Generated: ${outputPath}`);
console.log(`Paths: ${paths.length}`);
console.log(`Nodes: ${nodes.length}`);
console.log(`Seed: ${SEED}`);
