'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Smooth scroll-in reveal. IntersectionObserver misreports below-fold elements
// in this layout (tall sticky hero + Lenis), so we read the real position with
// getBoundingClientRect on scroll. Re-triggers every time the element enters
// the viewport — scroll away and back and it plays again.
export default function Reveal({ children, className = '', y = 28, variant = 'default' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();
  const headingReveal = variant === 'heading';
  const hiddenY = headingReveal ? Math.max(y, 44) : y;

  useEffect(() => {
    if (reduceMotion) {
      setInView(true);
      return undefined;
    }

    const el = ref.current;
    if (!el) return undefined;
    let frame = null;

    const check = () => {
      frame = null;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setInView(r.top < vh * 0.85 && r.bottom > vh * 0.1);
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(check);
    };

    const rearm = () => setInView(false);
    const replay = () => {
      setInView(false);
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(check);
      });
    };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hero:navigate', rearm);
    window.addEventListener('hero:reveal', replay);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hero:navigate', rearm);
      window.removeEventListener('hero:reveal', replay);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'none'
          : headingReveal
            ? `translateY(${hiddenY}px) scale(0.975)`
            : `translateY(${hiddenY}px)`,
        filter: headingReveal && !inView ? 'blur(9px)' : 'none',
        transition: reduceMotion
          ? 'none'
          : headingReveal
            ? 'opacity 0.82s cubic-bezier(0.22,1,0.36,1), transform 0.92s cubic-bezier(0.22,1,0.36,1), filter 0.82s cubic-bezier(0.22,1,0.36,1)'
            : 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        willChange: headingReveal ? 'opacity, transform, filter' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
