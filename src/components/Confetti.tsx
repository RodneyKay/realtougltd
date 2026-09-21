import React, { useMemo } from 'react';

const COLORS = ['#FFC700', '#FF3D71', '#00E0A1', '#3D8BFF', '#FFFFFF', '#FF8A3D'];

interface Piece {
  id: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
  shape: 'rect' | 'circle';
}

function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 6,
    duration: 2.2 + Math.random() * 1.6,
    delay: Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 220,
    spin: 360 + Math.random() * 360,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

/**
 * `burstKey` should be bumped every time the parent wants a fresh burst
 * (even if `active` was already true), so pieces regenerate with new
 * randomized trajectories instead of reusing a stale memoized set.
 */
export const Confetti: React.FC<{ active: boolean; burstKey: number }> = ({ active, burstKey }) => {
  const pieces = useMemo(() => (active ? generatePieces(80) : []), [active, burstKey]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '9999px' : '2px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.spin}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
