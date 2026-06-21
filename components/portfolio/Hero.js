'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILE_LINES = [
  { i: '01', text: "I don't just automate tasks — I fix the systems behind them.", hl: [] },
  { i: '02', text: 'With over 14 years of operational experience and a transition into AI-powered automation, I build workflows that actually work: n8n, Make.com, AI agents, integrations, and full-stack solutions when needed.', hl: ['14 years','AI-powered automation','n8n','Make.com','AI agents','integrations'] },
  { i: '03', text: "My advantage? I've personally experienced the operational challenges I now help businesses solve.", hl: [] },
  { i: '04', text: 'Open to freelance projects and new opportunities.', hl: [] },
];

const PROFILE_LINES_UA = [
  { i: '01', text: 'Я не просто автоматизую задачі — я виправляю системи, що стоять за ними.', hl: [] },
  { i: '02', text: 'Понад 14 років операційного досвіду та перехід у AI-автоматизацію: будую воркфлоу, які реально працюють — n8n, Make.com, AI-агенти, інтеграції та full-stack рішення там, де треба.', hl: ['14 років','AI-автоматизацію','n8n','Make.com','AI-агенти','інтеграції'] },
  { i: '03', text: 'Моя перевага? Я особисто пройшла через ті операційні виклики, які тепер допомагаю вирішувати бізнесам.', hl: [] },
  { i: '04', text: 'Відкрита до freelance-проєктів та нових можливостей.', hl: [] },
];

function highlight(text, words) {
  if (!words?.length) return text;
  const parts = [];
  let rest = text;
  const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  const split = rest.split(re);
  return split.map((s, i) => words.includes(s) ? <span key={i} className="text-[#c5ff00]">{s}</span> : <span key={i}>{s}</span>);
}

export default function Hero({ onContinue }) {
  const { t, lang } = useLang();
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [done, setDone] = useState(false);
  const progressRef = useRef(0);

  // Lock body scroll while hero is active
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [done]);

  // Load video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ready = () => setVideoReady(true);
    if (v.readyState >= 1) ready();
    v.addEventListener('loadedmetadata', ready);
    v.addEventListener('loadeddata', ready);
    v.addEventListener('canplay', ready);
    try { v.load(); } catch (e) {}
    const nudge = async () => { try { await v.play(); v.pause(); v.currentTime = 0.001; } catch (e) {} };
    nudge();
    return () => {
      v.removeEventListener('loadedmetadata', ready);
      v.removeEventListener('loadeddata', ready);
      v.removeEventListener('canplay', ready);
    };
  }, []);

  // Internal scroll progress driven by wheel/touch
  useEffect(() => {
    if (done) return;
    const TOTAL = 2400; // virtual distance
    let scrolled = progressRef.current * TOTAL;
    let touchY = null;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scrolled / TOTAL));
      progressRef.current = p;
      setProgress(p);
      const v = videoRef.current;
      if (v && v.duration && !isNaN(v.duration)) {
        const vp = Math.max(0, Math.min(1, (p - 0.05) / 0.85));
        try { v.currentTime = v.duration * vp; } catch (e) {}
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      scrolled = Math.min(TOTAL, Math.max(0, scrolled + e.deltaY));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const y = e.touches[0].clientY;
      const dy = touchY - y;
      touchY = y;
      scrolled = Math.min(TOTAL, Math.max(0, scrolled + dy * 2));
      if (!raf) raf = requestAnimationFrame(apply);
      e.preventDefault();
    };
    const onKey = (e) => {
      if (['ArrowDown','PageDown',' '].includes(e.key)) { scrolled = Math.min(TOTAL, scrolled + 120); if (!raf) raf = requestAnimationFrame(apply); }
      else if (['ArrowUp','PageUp'].includes(e.key)) { scrolled = Math.max(0, scrolled - 120); if (!raf) raf = requestAnimationFrame(apply); }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    apply();
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [done]);

  const intro = progress < 0.08;
  const nav = progress >= 0.08 && progress < 0.92;
  const ready = progress >= 0.92;

  const handleContinue = () => {
    setDone(true);
    setTimeout(() => {
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
      // give layout a tick, then smooth-scroll to about
      requestAnimationFrame(() => {
        const a = document.getElementById('about');
        if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      onContinue?.();
    }, 600);
  };

  const lines = lang === 'ua' ? PROFILE_LINES_UA : PROFILE_LINES;

  return (
    <AnimatePresence>
      {!done && (
        <motion.section
          id="top"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-40 w-full h-screen overflow-hidden bg-[#0a0a0a]"
        >
          <div className="absolute inset-0 grid-bg opacity-40" />

          {/* Video + crossfade to sunglasses image at the end */}
          <div className="absolute inset-0 flex">
            <div className="relative h-full w-full md:w-[58%]">
              {/* base: no sunglasses */}
              <img src="/assets/maria-no-sunglasses.jpg" alt=""
                className="absolute inset-0 w-full h-full object-cover object-left" />
              {/* video over base */}
              <video
                ref={videoRef}
                src="/assets/maria-video-opt.mp4"
                muted playsInline preload="auto"
                poster="/assets/maria-no-sunglasses.jpg"
                className="absolute inset-0 w-full h-full object-cover object-left"
                style={{ opacity: videoReady && progress > 0.02 && progress < 0.92 ? 1 : 0, transition: 'opacity .3s' }}
              />
              {/* final: with sunglasses */}
              <img src="/assets/maria-sunglasses.jpg" alt=""
                className="absolute inset-0 w-full h-full object-cover object-left transition-opacity duration-500"
                style={{ opacity: progress >= 0.85 ? 1 : 0 }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-[#0a0a0a]" />
            </div>
          </div>

          {/* Top bar (M.K + UA|EN) — fixed at top */}
          <div className="absolute top-0 left-0 right-0 z-30 px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/85">M.K — <span className="opacity-50">AI Automation</span></span>
            <LangSwitch />
          </div>

          {/* Right content layer */}
          <div className="relative z-10 h-full w-full flex flex-col justify-between px-6 md:px-12 lg:px-20 pt-20 pb-10">
            <div />
            <div className="md:ml-auto md:w-[52%] lg:w-[48%] min-h-[320px]">
              <AnimatePresence mode="wait">
                {intro && (
                  <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45 }}>
                    <div className="font-mono text-[11px] tracking-[0.3em] text-[#c5ff00] mb-6">/ INITIATING</div>
                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] font-medium text-white">{t.hero.name}</h1>
                    <div className="mt-5 text-xl md:text-2xl text-white/80">{t.hero.role}</div>
                    <p className="mt-6 text-base md:text-lg text-white/55 max-w-md">{t.hero.tagline}</p>
                    <div className="mt-10 flex flex-wrap gap-3">
                      <button className="group inline-flex items-center gap-2 bg-[#c5ff00] text-black px-5 py-3 rounded-full text-sm font-medium hover:bg-white transition">
                        {t.hero.cta1} <span className="group-hover:translate-x-1 transition">→</span>
                      </button>
                      <a href="/assets/resume.pdf" download className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition">
                        {t.hero.cta2}
                      </a>
                    </div>
                    {/* SCROLL TO ACTIVATE pill under buttons */}
                    <ScrollPill />
                  </motion.div>
                )}
                {nav && (
                  <motion.div key="nav" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <div className="font-mono text-[11px] tracking-[0.3em] text-[#c5ff00] mb-7">/ SECTIONS</div>
                    <ul className="space-y-1.5 font-mono text-base md:text-lg tracking-tight">
                      {t.nav.items.map((it, i) => (
                        <motion.li key={it} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="text-white/85 hover:text-[#c5ff00] transition">
                          <span className="inline-block">{it}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                {ready && (
                  <motion.div key="ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="font-mono text-[11px] tracking-[0.3em] text-[#c5ff00] mb-4 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> ONLINE
                    </div>
                    <div className="rounded-md border border-[#c5ff00]/40 px-4 py-2 inline-flex items-center gap-2 font-mono text-sm md:text-base text-[#c5ff00]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> &gt; SYSTEM READY
                    </div>
                    {/* Terminal profile card */}
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                      className="mt-4 rounded-xl border border-white/10 bg-black/55 backdrop-blur-sm overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/[0.03]">
                        <span className="w-2 h-2 rounded-full bg-red-400/80" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
                        <span className="w-2 h-2 rounded-full bg-green-400/80" />
                        <span className="ml-2 font-mono text-[11px] text-white/55">maria_kasycheva.sh</span>
                      </div>
                      <div className="px-4 py-4 font-mono text-[12.5px] md:text-[13px] leading-relaxed">
                        {lines.map((l, idx) => (
                          <motion.p key={l.i} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + idx * 0.18 }}
                            className="flex gap-3 mb-3 last:mb-0">
                            <span className="text-white/30 select-none">{l.i}</span>
                            <span className="text-white/85">{highlight(l.text, l.hl)}</span>
                          </motion.p>
                        ))}
                      </div>
                    </motion.div>
                    {/* Continue button */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }}
                      className="mt-5 flex items-center justify-center">
                      <button onClick={handleContinue}
                        className="group inline-flex items-center gap-3 border border-[#c5ff00]/60 hover:bg-[#c5ff00] hover:text-black text-white px-7 py-3 rounded-full font-mono text-sm tracking-[0.2em] transition">
                        CONTINUE <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>↓</motion.span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom progress meter */}
            <div className="flex items-center justify-end text-xs font-mono tracking-[0.25em] text-white/45">
              <div className="flex items-center gap-3">
                <span>{String(Math.round(progress * 100)).padStart(3, '0')}%</span>
                <div className="w-24 h-px bg-white/15 overflow-hidden">
                  <div className="h-full bg-[#c5ff00]" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function ScrollPill() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="mt-10 flex justify-center md:justify-start">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border border-white/15 bg-white/[0.03]">
        <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#c5ff00]/15 border border-[#c5ff00]/50">
          <motion.span animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 1.6 }}
            className="absolute inset-0 rounded-full bg-[#c5ff00]/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff00]" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/75">Scroll to Activate</span>
      </motion.div>
    </motion.div>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <button onClick={() => setLang('ua')} className={`px-2 py-1 transition ${lang==='ua' ? 'text-[#c5ff00]' : 'text-white/55 hover:text-white'}`}>UA</button>
      <span className="text-white/30">|</span>
      <button onClick={() => setLang('en')} className={`px-2 py-1 transition ${lang==='en' ? 'text-[#c5ff00]' : 'text-white/55 hover:text-white'}`}>EN</button>
    </div>
  );
}
