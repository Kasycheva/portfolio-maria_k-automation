'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  const { t } = useLang();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastAppliedRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Robust video loading + unlock seeking
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ready = () => setVideoReady(true);
    if (v.readyState >= 1) ready();
    v.addEventListener('loadedmetadata', ready);
    v.addEventListener('loadeddata', ready);
    v.addEventListener('canplay', ready);
    try { v.load(); } catch (e) {}
    (async () => { try { await v.play(); v.pause(); v.currentTime = 0.001; } catch (e) {} })();
    return () => {
      v.removeEventListener('loadedmetadata', ready);
      v.removeEventListener('loadeddata', ready);
      v.removeEventListener('canplay', ready);
    };
  }, []);

  // Scroll -> set TARGET progress + target video time. (Updates on every scroll event)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const v = videoRef.current;
      if (v && v.duration && !isNaN(v.duration)) {
        // Map 0..1 -> 0..duration with a tiny ease-out at the end so it lands cleanly on last frame
        const vp = Math.max(0, Math.min(1, p));
        targetTimeRef.current = v.duration * vp;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // RAF loop: smoothly LERP video.currentTime toward target. Decoupled from scroll = buttery smooth.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        // Smooth interpolation factor; lower = silkier (with more lag), higher = snappier
        currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * 0.18;
        // Only push to video if delta worth a paint
        if (Math.abs(currentTimeRef.current - lastAppliedRef.current) > 0.012) {
          try { v.currentTime = currentTimeRef.current; lastAppliedRef.current = currentTimeRef.current; } catch (e) {}
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const intro = progress < 0.1;
  const nav = progress >= 0.1 && progress < 0.78;
  const ready = progress >= 0.78;

  return (
    <section id="top" ref={containerRef} className="relative w-full" style={{ height: '350vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* ONE video element — its last frame already shows sunglasses, no image crossfade jumps */}
        <div className="absolute inset-0 flex">
          <div className="relative h-full w-full md:w-[58%]">
            <video
              ref={videoRef}
              src="/assets/maria-video-hq.mp4"
              muted playsInline preload="auto"
              poster="/assets/maria-no-sunglasses.jpg"
              className="absolute inset-0 w-full h-full object-cover object-left"
              style={{ opacity: videoReady ? 1 : 0, transition: 'opacity .4s' }}
            />
            {/* Subtle fallback while metadata loads */}
            <img src="/assets/maria-no-sunglasses.jpg" alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover object-left pointer-events-none"
              style={{ opacity: videoReady ? 0 : 1, transition: 'opacity .4s' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-[#0a0a0a]" />
          </div>
        </div>

        {/* Right content layer */}
        <div className="relative z-10 h-full w-full flex flex-col justify-between px-6 md:px-12 lg:px-20 pt-28 pb-10">
          <div />
          <div className="md:ml-auto md:w-[48%] lg:w-[44%] min-h-[320px]">
            <AnimatePresence mode="wait">
              {intro && (
                <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-6">/ INITIATING</div>
                  <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] font-medium text-white">{t.hero.name}</h1>
                  <div className="mt-5 text-xl md:text-2xl text-white/80">{t.hero.role}</div>
                  <p className="mt-6 text-base md:text-lg text-white/55 max-w-md">{t.hero.tagline}</p>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <a href="#cases" className="group inline-flex items-center gap-2 bg-[#c5ff00] text-black px-5 py-3 rounded-full text-sm font-medium hover:bg-white transition">
                      {t.hero.cta1} <span className="group-hover:translate-x-1 transition">→</span>
                    </a>
                    <a href="/assets/resume.pdf" download className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition">
                      {t.hero.cta2}
                    </a>
                  </div>
                  <ScrollPill />
                </motion.div>
              )}
              {nav && (
                <motion.div key="nav" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">/ SECTIONS</div>
                  <ul className="space-y-3 text-2xl md:text-3xl lg:text-4xl font-medium">
                    {t.nav.items.map((it, i) => (
                      <motion.li key={it}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="text-white/85 hover:text-[#c5ff00] transition">
                        <a href={['#about','#skills','#cases','#workflow','#ai','#contact'][i]}>{it}</a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {ready && (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-6 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#c5ff00] animate-pulse" /> ONLINE
                  </div>
                  <h2 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-white">{t.hero.ready}</h2>
                  <p className="mt-6 text-white/55 max-w-md">{t.hero.tagline}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end text-xs font-mono tracking-[0.25em] text-white/45">
            <div className="flex items-center gap-3">
              <span>{String(Math.round(progress * 100)).padStart(3, '0')}%</span>
              <div className="w-24 h-px bg-white/15 overflow-hidden">
                <div className="h-full bg-[#c5ff00]" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Elongated transparent oval pill, slight float animation (like a jacket zipper pull)
function ScrollPill() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="mt-10">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="inline-flex items-center px-5 py-2 rounded-full border border-white/25 bg-transparent">
        <span className="font-sans text-[13px] tracking-wide text-white/85">Scroll to Activate</span>
      </motion.div>
    </motion.div>
  );
}
