# Constitution Website Evolution Roadmap

**Goal:** Transform from static presentation → living coordination space
**Timeline:** 3 months (Feb - May 2026)
**Inspiration:** Gemini mockups, spherical mycelium, organic feel

---

## Phase 1: Foundation (Weeks 1-2)
*Make the current implementation solid and interactive*

### Week 1: Polish & Interaction
- [ ] **Mouse interaction** — particles attract/repel near cursor
- [ ] **Heartbeat pulse** — periodic light wave through network lines
- [ ] **Fix particle visibility** — ensure 300 particles always visible
- [ ] **Smooth performance** — consistent 60fps rendering

### Week 2: Card Improvements  
- [ ] **Human silhouette icons** — replace teal icons with black stick figures
- [ ] **Card hover physics** — subtle float/levitation on hover (CSS only)
- [ ] **Golden CTA button** — solid gold "Read the Constitution"
- [ ] **Better card shadows** — soft depth shadows

**Deliverable:** Interactive network that responds to mouse, pulsing heartbeat, polished cards

---

## Phase 2: Network Evolution (Weeks 3-6)
*Make the network feel more organic and 3D*

### Week 3: Varied Node Sizes
- [ ] **Node size variation** — some nodes 2x-4x larger
- [ ] **Cluster nodes** — some positions have 3-5 nodes clustered
- [ ] **Node glow intensity** — larger nodes glow brighter
- [ ] **Z-depth simulation** — some nodes slightly transparent (further away)

### Week 4: Curved Connections
- [ ] **Bezier curves** — replace straight lines with quadratic curves
- [ ] **Organic flow** — curves follow flow field direction
- [ ] **Line thickness variation** — thicker near nodes, thinner in middle

### Week 5: Spherical Distribution
- [ ] **Circular boundary** — particles stay within ellipse, not rectangle
- [ ] **Edge density** — more particles near edges, fewer in center
- [ ] **Wrap behavior** — particles wrap around ellipse, not rectangle

### Week 6: Color & Polish
- [ ] **Warmer palette** — shift from gold-silver to mostly gold
- [ ] **Metallic sheen** — simulate light reflection on nodes
- [ ] **Background gradient** — subtle radial vignette

**Deliverable:** Organic, spherical-feeling network with curved lines and varied nodes

---

## Phase 3: 3D Elements (Weeks 7-10)
*Add depth and Three.js for premium feel*

### Week 7: Three.js Setup
- [ ] **React Three Fiber** — install and configure
- [ ] **Hybrid rendering** — 3D background, 2D UI overlay
- [ ] **Performance baseline** — ensure mobile still works

### Week 8: 3D Nodes
- [ ] **Polyhedra geometry** — icosahedrons, dodecahedrons for some nodes
- [ ] **Metallic material** — gold PBR material with reflections
- [ ] **Depth of field** — subtle blur on far nodes

### Week 9: 3D Connections
- [ ] **Tube geometry** — 3D tubes instead of 2D lines
- [ ] **Glow shader** — bloom effect on connections
- [ ] **Pulse shader** — light traveling through tubes

### Week 10: Camera & Interaction
- [ ] **Subtle camera sway** — gentle movement tied to mouse
- [ ] **Parallax depth** — layers move at different speeds
- [ ] **Click interactions** — clicking node reveals info

**Deliverable:** Full 3D mycelium network with metallic nodes and glowing connections

---

## Phase 4: Symbiosis & Polish (Weeks 11-12)
*Human-AI integration and final touches*

### Week 11: Human + Agent Nodes
- [ ] **Human nodes** — silhouette icons embedded in network
- [ ] **Agent orbs** — glowing geometric shapes
- [ ] **Tethers** — visible connections between humans and agents
- [ ] **Hover reveals** — hovering principle shows related entities

### Week 12: Final Polish
- [ ] **Mobile optimization** — 2D fallback for low-power devices
- [ ] **Loading states** — graceful loading animation
- [ ] **Accessibility** — reduced motion preference support
- [ ] **Performance audit** — lighthouse score > 90

**Deliverable:** Complete living coordination space

---

## Technical Dependencies

### Already Have
- Next.js 14
- Tailwind CSS
- Canvas 2D animation
- Framer Motion (can add)

### Need to Add (Phase 3)
- @react-three/fiber
- @react-three/drei
- three.js
- postprocessing (bloom)

---

## Milestones

| Date | Milestone |
|------|-----------|
| Feb 28 | Phase 1 complete — interactive, pulsing |
| Mar 15 | Phase 2 complete — organic, spherical |
| Apr 15 | Phase 3 complete — 3D mycelium |
| May 1 | Phase 4 complete — human-AI symbiosis |

---

## Quick Wins (Can Do Anytime)
- [ ] Add `cursor: pointer` on interactive elements
- [ ] Preload fonts
- [ ] Add favicon
- [ ] Meta tags for social sharing
- [ ] OG image generation

---

## Not In Scope (Future)
- Semantic aggregation UI
- Socratic deliberation interface
- Real-time multi-user presence
- WebGL fallback for old browsers
- Native mobile app

---

*Last updated: 2026-02-18*
