'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type Sparkle = {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
};

function generateSparkle(): Sparkle {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.4,
  };
}

export function Sparkles({ count = 4, color = '#F6C453' }: { count?: number; color?: string }) {
  const initialSparkles = useMemo(() => Array.from({ length: count }, generateSparkle), [count]);
  const [sparkles, setSparkles] = useState<Sparkle[]>(initialSparkles);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = generateSparkle();
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            ease: 'easeOut',
          }}
        >
          <svg width={sparkle.size} height={sparkle.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill={color}
            />
          </svg>
        </motion.span>
      ))}
    </span>
  );
}

export function GlowButton({
  children,
  onClick,
  className = '',
  glowColor = 'rgba(246, 196, 83, 0.6)',
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glowColor?: string;
  variant?: 'primary' | 'secondary' | 'nav';
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = {
    primary: 'bg-text text-background font-bold shadow-sm',
    secondary: 'border border-text/15 bg-background/70 text-text font-bold',
    nav: 'text-text/80 font-semibold',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center rounded-full transition ${baseStyles[variant]} ${className}`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: isHovered ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}` : 'none',
      }}
    >
      {isHovered && variant !== 'nav' && <Sparkles count={5} />}
      {isHovered && variant === 'nav' && <Sparkles count={3} color="#F6C453" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export function GlowSubmitButton({
  children,
  className = '',
  glowColor = 'rgba(246, 196, 83, 0.6)',
  bgColor = 'bg-success',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  bgColor?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="submit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center rounded-full font-bold text-text transition ${bgColor} ${className}`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: isHovered ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}` : 'none',
      }}
    >
      {isHovered && <Sparkles count={5} />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
