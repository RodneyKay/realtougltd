import React, { useMemo } from 'react';

const COLORS = ['#FDE68A', '#93C5FD', '#F9A8D4', '#FFFFFF', '#5EEAD4'];

interface Particle {
  id: number;
  top: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle';
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 3 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 3 + Math.random() * 3,
    delay: Math.random() * 3,
    drift: (Math.random() - 0.5) * 16,
    opacity: 0.35 + Math.random() * 0.5,
    shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

/** Purely decorative starfield dots/shapes for the autopilot-on background. */
export const StarfieldParticles: React.FC<{ active: boolean }> = ({ active }) => {
  const particles = useMemo(() => generateParticles(24), []);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-float"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape === 'triangle' ? 'transparent' : p.color,
            borderRadius: p.shape === 'circle' ? '9999px' : p.shape === 'square' ? '2px' : 0,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--particle-drift' as string]: `${p.drift}px`,
            ['--particle-opacity' as string]: `${p.opacity}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
