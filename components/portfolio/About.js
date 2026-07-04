'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function About() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const transitionRef = useRef(false);
  const frameRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const lastIndex = t.about.body.length - 1;

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true);
      return;
    }

    const checkPosition = () => {
      frameRef.current = null;
      if (transitionRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isVisible = rect.top < viewportHeight * 0.78 && rect.bottom > viewportHeight * 0.18;
      setRevealed(isVisible);
    };

    const scheduleCheck = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(checkPosition);
    };

    const reveal = () => {
      transitionRef.current = false;
      checkPosition();
    };

    // Keep the reset behind the Hero transition, then let ordinary viewport
    // exits re-arm the section so it also replays when scrolling back to it.
    const rearm = () => {
      transitionRef.current = true;
      setRevealed(false);
    };

    checkPosition();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);
    window.addEventListener('hero:reveal', reveal);
    window.addEventListener('hero:navigate', rearm);
    return () => {
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      window.removeEventListener('hero:reveal', reveal);
      window.removeEventListener('hero:navigate', rearm);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [reduceMotion]);

  const show = (props) => (reduceMotion || revealed ? props.to : props.from);
  const duration = (value) => (reduceMotion ? 0 : value);

  return (
    <section ref={sectionRef} id="about" className="relative py-28 sm:py-32 md:py-44 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Very faint accent glow for a hint of depth (kept subtle on purpose) */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-[320px] w-[320px] rounded-full bg-[#c5ff00]/[0.05] blur-[150px]" />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Left — kicker and serif title */}
        <div className="md:col-span-5 md:sticky md:top-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } })}
            transition={{ duration: duration(0.6), ease: EASE }}
            className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-5 sm:mb-6"
          >
            {t.about.kicker}
          </motion.div>

          {/* Word-by-word mask reveal: each word slides up from behind a clip */}
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[5.25rem] leading-[0.95] tracking-tight">
            {t.about.heading.split(' ').map((word, i, arr) => (
              <span
                key={`${word}-${i}`}
                className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
                style={{ marginRight: i < arr.length - 1 ? '0.22em' : 0 }}
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={show({ from: { y: '110%' }, to: { y: '0%' } })}
                  transition={{ duration: duration(0.8), delay: reduceMotion ? 0 : 0.15 + i * 0.12, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>

        {/* Right — lead, body, closing and tags */}
        <div className="md:col-span-7 md:pt-2">
          <div className="relative pl-5 sm:pl-7">
            <motion.span
              aria-hidden
              initial={{ scaleY: 0 }}
              animate={show({ from: { scaleY: 0 }, to: { scaleY: 1 } })}
              transition={{ duration: duration(0.9), delay: reduceMotion ? 0 : 0.25, ease: EASE }}
              className="absolute inset-y-1 left-0 w-px origin-top bg-gradient-to-b from-[#c5ff00] via-[#c5ff00]/45 to-transparent"
            />
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={show({ from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 } })}
              transition={{ duration: duration(0.7), delay: reduceMotion ? 0 : 0.35, ease: EASE }}
              className="text-xl sm:text-2xl md:text-3xl leading-snug text-white font-light"
            >
              {highlightAbout(t.about.lead)}
            </motion.p>
          </div>

          <div className="mt-7 sm:mt-8 space-y-5 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t.about.body.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={show({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } })}
                transition={{ duration: duration(0.6), delay: reduceMotion ? 0 : 0.48 + i * 0.1, ease: EASE }}
                className="grid grid-cols-[1.75rem_1fr] gap-2 sm:gap-3"
              >
                <span aria-hidden className="pt-[0.35em] font-mono text-[9px] tracking-[0.16em] text-[#c5ff00]/45">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={i === lastIndex ? 'text-white font-normal text-lg sm:text-xl' : 'text-white/55'}>
                  {highlightAbout(p)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={show({ from: { opacity: 0 }, to: { opacity: 1 } })}
            transition={{ duration: duration(0.7), delay: reduceMotion ? 0 : 0.5 + t.about.body.length * 0.1, ease: EASE }}
            className="mt-8 flex items-start gap-3 font-mono text-xs sm:text-sm tracking-[0.06em] text-white/45"
          >
            <motion.span
              aria-hidden
              animate={reduceMotion || !revealed ? undefined : { opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c5ff00] shadow-[0_0_10px_rgba(197,255,0,0.55)]"
            />
            <span>{t.about.closing}</span>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-2">
            {t.about.tags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={show({ from: { opacity: 0, y: 12, scale: 0.97 }, to: { opacity: 1, y: 0, scale: 1 } })}
                transition={{ duration: duration(0.45), delay: reduceMotion ? 0 : 0.62 + t.about.body.length * 0.1 + i * 0.045, ease: EASE }}
                className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70 transition-colors duration-300 hover:border-[#c5ff00]/45 hover:text-[#c5ff00] sm:text-xs"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function highlightAbout(text) {
  const terms = /(14 years|AI automation|AI-powered automation|n8n|Make\.com|AI agents|full-stack development|digital marketing|Meta Ads|Google Ads|GA4|14 років|AI-автоматизац(?:ії|ію)|AI-агентами|фулстек-розробку|діджитал-маркетингу)/gi;
  const exactTerm = /^(14 years|AI automation|AI-powered automation|n8n|Make\.com|AI agents|full-stack development|digital marketing|Meta Ads|Google Ads|GA4|14 років|AI-автоматизац(?:ії|ію)|AI-агентами|фулстек-розробку|діджитал-маркетингу)$/i;

  return text.split(terms).map((part, index) =>
    exactTerm.test(part)
      ? <span key={`${part}-${index}`} className="text-[#c5ff00]">{part}</span>
      : part
  );
}
