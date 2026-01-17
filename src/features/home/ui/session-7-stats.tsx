'use client';

import { useEffect, useState } from 'react';

// Session7: 통계 섹션
export function Session7() {
  const stats = [
    { target: 850, suffix: '+', label: '정시 전문 강사' },
    { target: 12400, suffix: '+', label: '초중고 재학생' },
    { target: 89, suffix: '%', label: '목표 달성률' },
    { target: 326, suffix: '명', prefix: 'SKY ', label: '2026년 합격생' },
  ];

  return (
    <section className="w-full bg-white px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              stat={stat}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatItemProps {
  stat: {
    target: number;
    suffix: string;
    prefix?: string;
    label: string;
  };
  delay: number;
}

function StatItem({ stat, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const elementId = `stat-${stat.label}`;
    const element = document.getElementById(elementId);

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          // 한 번만 실행되도록 observer 해제
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1, // 요소가 10%만 보여도 시작
        rootMargin: '0px 0px -50px 0px', // 뷰포트 하단에서 50px 전에 시작
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [stat.label]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2초
    const steps = 60;
    const increment = stat.target / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          setCount(stat.target);
          clearInterval(interval);
          // 숫자가 목표값에 도달한 후 500ms 뒤에 "공개 예정" 표시
          setTimeout(() => {
            setShowComingSoon(true);
          }, 300);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => {
        clearInterval(interval);
      };
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, stat.target, delay]);

  return (
    <div
      id={`stat-${stat.label}`}
      className="text-center"
    >
      {showComingSoon ? (
        <div className="mb-2 text-3xl font-bold text-gray-400 md:text-4xl lg:text-5xl">
          공개 예정
        </div>
      ) : (
        <div className="mb-2 text-3xl font-bold text-[#ff4500] md:text-4xl lg:text-5xl">
          {stat.prefix || ''}
          {stat.suffix === '%' ? count : count.toLocaleString()}
          {stat.suffix}
        </div>
      )}
      <div className="text-sm text-gray-600 md:text-base lg:text-lg">
        {stat.label}
      </div>
    </div>
  );
}
