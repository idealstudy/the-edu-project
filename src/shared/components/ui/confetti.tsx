'use client';

import { useEffect, useState } from 'react';

const COLORS = [
  'var(--orange-3)',
  'var(--orange-4)',
  'var(--orange-5)',
  'var(--orange-7)',
  'var(--orange-9)',
  'var(--gray-4)',
  'var(--gray-7)',
];

const PARTICLE_COUNT = 50;

type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: 'rect' | 'circle';
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * 정복·레벨업 시 표시되는 경량 confetti 애니메이션.
 * 외부 라이브러리 없음 — CSS @keyframes confetti-fall(globals.css) + 인라인 style 사용.
 * auto: 2.5 s 후 자동 소멸.
 */
export const Confetti = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const ps: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: rand(0, 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0]!,
      delay: rand(0, 500),
      duration: rand(1200, 2200),
      size: rand(7, 13),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));
    setParticles(ps);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={
            p.shape === 'circle'
              ? 'absolute rounded-full'
              : 'absolute rounded-sm'
          }
          style={{
            left: `${p.x}%`,
            top: '-16px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}ms ease-in ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
};
