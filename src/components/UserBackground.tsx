import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  color: string;
  shadowColor: string;
  opacity: number;
  duration: number; // seconds for gentle pulse
  delay: number; // seconds
}

export default function UserBackground() {
  // Pre-generate stable positions for luminous particles matching Screenshot_20260818-184526.png
  const particles: Particle[] = useMemo(() => {
    const colorPalette = [
      { color: '#00f0ff', shadow: 'rgba(0, 240, 255, 0.9)' },     // Cyan
      { color: '#2dd4bf', shadow: 'rgba(45, 212, 191, 0.85)' },   // Turquoise
      { color: '#38bdf8', shadow: 'rgba(56, 189, 248, 0.85)' },   // Sky blue
      { color: '#c084fc', shadow: 'rgba(192, 132, 252, 0.85)' },  // Light purple
      { color: '#a855f7', shadow: 'rgba(168, 85, 247, 0.8)' },    // Violet
      { color: '#34d399', shadow: 'rgba(52, 211, 153, 0.85)' },   // Emerald mint
      { color: '#e0f2fe', shadow: 'rgba(224, 242, 254, 0.9)' },   // Diamond white
    ];

    // Carefully distributed particles across the height
    const fixedSeeds = [
      { x: 18, y: 8, colorIdx: 0, size: 2.5, opacity: 0.85, dur: 4.2, del: 0 },
      { x: 42, y: 12, colorIdx: 1, size: 1.8, opacity: 0.75, dur: 3.8, del: 1.2 },
      { x: 78, y: 9, colorIdx: 3, size: 2.2, opacity: 0.8, dur: 5.1, del: 0.5 },
      { x: 88, y: 16, colorIdx: 0, size: 1.5, opacity: 0.7, dur: 4.0, del: 2.1 },
      { x: 12, y: 22, colorIdx: 4, size: 2.8, opacity: 0.9, dur: 4.6, del: 1.5 },
      { x: 58, y: 29, colorIdx: 0, size: 3.2, opacity: 0.95, dur: 3.5, del: 0.8 },
      { x: 92, y: 26, colorIdx: 2, size: 1.6, opacity: 0.65, dur: 4.8, del: 3.0 },
      { x: 35, y: 36, colorIdx: 3, size: 2.4, opacity: 0.85, dur: 5.5, del: 1.8 },
      { x: 45, y: 39, colorIdx: 0, size: 1.8, opacity: 0.75, dur: 4.1, del: 0.2 },
      { x: 82, y: 44, colorIdx: 1, size: 3.0, opacity: 0.9, dur: 3.9, del: 2.5 },
      { x: 22, y: 51, colorIdx: 0, size: 2.0, opacity: 0.8, dur: 4.4, del: 1.1 },
      { x: 62, y: 56, colorIdx: 4, size: 2.6, opacity: 0.85, dur: 5.2, del: 0.7 },
      { x: 15, y: 64, colorIdx: 2, size: 1.8, opacity: 0.7, dur: 4.7, del: 2.9 },
      { x: 52, y: 67, colorIdx: 0, size: 2.2, opacity: 0.8, dur: 3.6, del: 1.4 },
      { x: 85, y: 72, colorIdx: 3, size: 2.5, opacity: 0.85, dur: 4.9, del: 0.3 },
      { x: 32, y: 78, colorIdx: 1, size: 3.4, opacity: 0.95, dur: 4.3, del: 2.0 },
      { x: 74, y: 84, colorIdx: 0, size: 1.6, opacity: 0.65, dur: 5.0, del: 1.7 },
      { x: 25, y: 89, colorIdx: 5, size: 2.0, opacity: 0.75, dur: 4.5, del: 0.9 },
      { x: 65, y: 93, colorIdx: 2, size: 2.8, opacity: 0.85, dur: 3.7, del: 2.4 },
      { x: 48, y: 96, colorIdx: 0, size: 1.8, opacity: 0.7, dur: 4.2, del: 1.3 },
      // Supplementary micro stars for galaxy depth
      { x: 8, y: 15, colorIdx: 6, size: 1.2, opacity: 0.6, dur: 3.2, del: 0.4 },
      { x: 28, y: 24, colorIdx: 6, size: 1.4, opacity: 0.65, dur: 4.5, del: 1.9 },
      { x: 72, y: 19, colorIdx: 6, size: 1.2, opacity: 0.55, dur: 5.0, del: 2.2 },
      { x: 94, y: 38, colorIdx: 6, size: 1.5, opacity: 0.7, dur: 3.8, del: 0.6 },
      { x: 6, y: 45, colorIdx: 0, size: 2.2, opacity: 0.8, dur: 4.1, del: 3.1 },
      { x: 38, y: 58, colorIdx: 6, size: 1.3, opacity: 0.6, dur: 4.9, del: 1.0 },
      { x: 90, y: 62, colorIdx: 4, size: 2.4, opacity: 0.8, dur: 5.3, del: 2.7 },
      { x: 19, y: 73, colorIdx: 6, size: 1.2, opacity: 0.55, dur: 3.9, del: 0.5 },
      { x: 81, y: 81, colorIdx: 1, size: 2.0, opacity: 0.75, dur: 4.6, del: 1.6 },
      { x: 10, y: 92, colorIdx: 6, size: 1.4, opacity: 0.6, dur: 4.0, del: 2.8 },
      { x: 88, y: 94, colorIdx: 0, size: 2.2, opacity: 0.8, dur: 3.5, del: 0.9 },
    ];

    return fixedSeeds.map((seed, idx) => {
      const palette = colorPalette[seed.colorIdx % colorPalette.length];
      return {
        id: idx,
        x: seed.x,
        y: seed.y,
        size: seed.size,
        color: palette.color,
        shadowColor: palette.shadow,
        opacity: seed.opacity,
        duration: seed.dur,
        delay: seed.del,
      };
    });
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none"
      id="aura-user-background-layer"
      aria-hidden="true"
    >
      {/* 1. BASE DARK TEAL-TO-MIDNIGHT GRADIENT (Exact match to screenshot) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #003e3a 0%, #023133 12%, #03242c 25%, #041b25 45%, #03141f 68%, #020c16 85%, #01070e 100%)',
        }}
      />

      {/* 2. TOP RADIANT EMERALD-CYAN ATMOSPHERIC AURA (Top center glow from screenshot) */}
      <div 
        className="absolute top-0 left-0 right-0 h-[480px] w-full"
        style={{
          background: 'radial-gradient(ellipse 95% 55% at 50% -5%, rgba(0, 168, 145, 0.45) 0%, rgba(0, 102, 95, 0.3) 35%, rgba(2, 45, 52, 0.12) 65%, transparent 100%)',
        }}
      />

      {/* 3. SECONDARY TOP-LEFT & TOP-RIGHT LIGHT SHIMMER ACCENTS */}
      <div 
        className="absolute top-0 left-0 w-full h-[600px] opacity-60"
        style={{
          background: 'radial-gradient(circle at 20% 10%, rgba(45, 212, 191, 0.2) 0%, transparent 45%), radial-gradient(circle at 80% 18%, rgba(6, 182, 212, 0.18) 0%, transparent 50%)',
        }}
      />

      {/* 4. MID-BODY SUBTLE ATMOSPHERIC MESH WAVES */}
      <div 
        className="absolute inset-0 w-full h-full opacity-35"
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(14, 116, 144, 0.1) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* 5. LUMINOUS FLOATING PARTICLES & STARS (Matching screenshot bokeh constellation) */}
      <div className="absolute inset-0 w-full h-full">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.shadowColor}, 0 0 ${p.size * 5}px ${p.shadowColor}`,
              opacity: p.opacity,
              animation: `particleTwinkle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Global CSS for particle twinkling and smooth performance */}
      <style>{`
        @keyframes particleTwinkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }
      `}</style>
    </div>
  );
}
