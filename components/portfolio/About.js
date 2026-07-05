'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useLang } from './LangContext';

const EASE = [0.22, 1, 0.36, 1];

const HIDDEN = {
  opacity: 0,
  x: 22,
  y: 18,
  filter: 'blur(5px)',
  clipPath: 'inset(0 0 0 7%)',
};

const VISIBLE = {
  opacity: 1,
  x: 0,
  y: 0,
  filter: 'blur(0px)',
  clipPath: 'inset(0 0 0 0)',
};

const BODY_HIDDEN = {
  opacity: 0,
  x: 14,
  y: 10,
  clipPath: 'inset(0 0 0 4%)',
};

const BODY_VISIBLE = {
  opacity: 1,
  x: 0,
  y: 0,
  clipPath: 'inset(0 0 0 0)',
};

export default function About() {
  const { t, lang } = useLang();
  const sectionRef = useRef(null);
  const articleRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const introVisible = useViewportPresence(sectionRef, 0.82, 0.15);
  const [revealCycle, setRevealCycle] = useState(0);
  const lineProgress = useArticleProgress(articleRef);
  const showIntro = reduceMotion || introVisible;
  const lastIndex = t.about.body.length - 1;

  useEffect(() => {
    const replayAfterHero = () => setRevealCycle((cycle) => cycle + 1);
    window.addEventListener('hero:reveal', replayAfterHero);
    return () => window.removeEventListener('hero:reveal', replayAfterHero);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden px-6 py-28 sm:py-32 md:px-12 md:py-44 lg:px-20"
    >
      <div className="pointer-events-none absolute -top-16 left-1/4 h-[320px] w-[320px] rounded-full bg-[#c5ff00]/[0.035] blur-[150px]" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:sticky md:top-28 md:col-span-5">
          <motion.div
            key={`about-label-${revealCycle}`}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={showIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: EASE }}
            className="mb-5 font-mono text-xs tracking-[0.3em] text-[#c5ff00] sm:mb-6"
          >
            {t.about.kicker}
          </motion.div>

          <div className="overflow-hidden pb-[0.08em]">
            <motion.h2
              key={`about-heading-${revealCycle}`}
              initial={reduceMotion ? false : { opacity: 0, y: '34%', filter: 'blur(8px)' }}
              animate={showIntro
                ? { opacity: 1, y: '0%', filter: 'blur(0px)' }
                : { opacity: 0, y: '34%', filter: 'blur(8px)' }}
              transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
              className={`font-serif text-4xl leading-[0.95] tracking-tight sm:text-5xl ${
                lang === 'ua'
                  ? 'md:text-[3.65rem] lg:text-[4.35rem] xl:text-[4.6rem]'
                  : 'md:text-6xl lg:text-[5.25rem]'
              }`}
            >
              {t.about.heading}
            </motion.h2>
          </div>
        </div>

        <div ref={articleRef} className="relative md:col-span-7 md:pt-2">
          <div aria-hidden className="absolute -left-4 top-1 h-[calc(100%-0.25rem)] w-px bg-white/[0.09] sm:-left-7">
            <motion.span
              className="block h-full w-px origin-top bg-[#c5ff00] shadow-[0_0_12px_rgba(197,255,0,0.18)]"
              style={{ scaleY: reduceMotion ? 1 : lineProgress }}
            />
          </div>

          <motion.p
            key={`about-lead-${revealCycle}`}
            initial={reduceMotion ? false : HIDDEN}
            animate={showIntro ? VISIBLE : HIDDEN}
            transition={{ duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.18, ease: EASE }}
            className="max-w-2xl text-xl font-light leading-snug text-white sm:text-2xl md:text-3xl"
          >
            {t.about.lead}
          </motion.p>

          <div className="mt-9 max-w-2xl space-y-6 text-base leading-relaxed text-white/[0.68] sm:text-lg sm:leading-relaxed">
            {t.about.body.map((paragraph, index) => (
              <ReadingParagraph
                key={`${revealCycle}-${index}-${paragraph.slice(0, 18)}`}
                reduceMotion={reduceMotion}
                statement={index === lastIndex}
              >
                {paragraph}
              </ReadingParagraph>
            ))}
          </div>

          <ReadingMeta key={`about-meta-${revealCycle}`} reduceMotion={reduceMotion}>
            <p className="mt-9 font-mono text-xs tracking-[0.06em] text-white/48 sm:text-sm">
              {t.about.closing}
            </p>

            <div className="mt-10 flex flex-wrap gap-2">
              {t.about.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70 sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </ReadingMeta>
        </div>
      </div>
    </section>
  );
}

function ReadingParagraph({ children, reduceMotion, statement = false }) {
  const paragraphRef = useRef(null);
  const visible = useViewportPresence(paragraphRef, statement ? 0.82 : 0.88, 0.12);

  return (
    <motion.p
      ref={paragraphRef}
      initial={reduceMotion ? false : BODY_HIDDEN}
      animate={reduceMotion || visible ? BODY_VISIBLE : BODY_HIDDEN}
      transition={{ duration: reduceMotion ? 0 : 0.54, ease: EASE }}
      className={statement
        ? 'mt-9 border-t border-white/12 pt-8 font-serif text-2xl leading-snug text-white sm:text-3xl'
        : ''}
    >
      {children}
    </motion.p>
  );
}

function ReadingMeta({ children, reduceMotion }) {
  const metaRef = useRef(null);
  const visible = useViewportPresence(metaRef, 0.9, 0.08);

  return (
    <motion.div
      ref={metaRef}
      initial={reduceMotion ? false : { opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={reduceMotion || visible
        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
        : { opacity: 0, y: 20, filter: 'blur(4px)' }}
      transition={{ duration: reduceMotion ? 0 : 0.58, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function useViewportPresence(ref, enterAt, leaveAt) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = null;

    const check = () => {
      frame = null;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      setVisible(rect.top < viewportHeight * enterAt && rect.bottom > viewportHeight * leaveAt);
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [ref, enterAt, leaveAt]);

  return visible;
}

function useArticleProgress(ref) {
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
  });

  useEffect(() => {
    let frame = null;

    const update = () => {
      frame = null;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const travel = rect.height + viewportHeight * 0.46;
      const progress = (viewportHeight * 0.78 - rect.top) / travel;
      rawProgress.set(Math.min(1, Math.max(0, progress)));
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [rawProgress, ref]);

  return smoothProgress;
}
