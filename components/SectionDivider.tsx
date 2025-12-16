'use client';

import { motion } from 'framer-motion';

export function SectionDivider({
  variant = 'star',
}: {
  variant?: 'star' | 'flower' | 'dots' | 'simple';
}) {
  const ornaments = {
    star: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
        <path
          d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </svg>
    ),
    flower: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.5" />
        <circle cx="12" cy="6" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="12" cy="18" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="6" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="18" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <circle cx="8" cy="8" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="16" cy="8" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="8" cy="16" r="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="16" cy="16" r="2" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
    dots: (
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        <span className="h-2 w-2 rounded-full bg-primary/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
      </div>
    ),
    simple: null,
  };

  return (
    <motion.div
      className="my-12 flex items-center justify-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-text/10 to-text/10" />
      {ornaments[variant] && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          {ornaments[variant]}
        </motion.div>
      )}
      <div className="h-px flex-1 bg-linear-to-l from-transparent via-text/10 to-text/10" />
    </motion.div>
  );
}
