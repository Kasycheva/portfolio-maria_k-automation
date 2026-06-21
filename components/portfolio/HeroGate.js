'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILE_LINES_EN = [
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
  const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  return text.split(re).map((s, i) => words.includes(s) ? <span key={i} className="text-[#c5ff00]">{s}</span> : <span key={i}>{s}</span>);
}

export default function HeroGate() {
  const { lang } = useLang();
  const sectionRef = useRef(null);
  const [continueClicked, setContinueClicked] = useState(false);
  const [inView, setInView] = useState(false);

  // Use IntersectionObserver to detect when section is mostly in view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio > 0.6),
      { threshold: [0, 0.3, 0.6, 0.9, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Lock body scroll while section in view and Continue not clicked
  const shouldLock = inView && !continueClicked;
  useEffect(() => {
    if (!shouldLock) return;
    if (typeof window !== 'undefined' && window.__lenis) window.__lenis.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      if (typeof window !== 'undefined' && window.__lenis) window.__lenis.start();
      document.body.style.overflow = '';
    };
  }, [shouldLock]);

  const handleContinue = () => {
    setContinueClicked(true);
    document.body.style.overflow = '';
    if (typeof window !== 'undefined' && window.__lenis) window.__lenis.start();
    setTimeout(() => {
      const a = document.getElementById('about');
      if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const lines = lang === 'ua' ? PROFILE_LINES_UA : PROFILE_LINES_EN;

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Sunglasses photo on left — for visual continuity with Hero's last frame */}
      <div className="absolute inset-0 flex">
        <div className="relative h-full w-full md:w-[58%]">
          <img src="/assets/maria-sunglasses.jpg" alt=""
            className="absolute inset-0 w-full h-full object-cover object-left" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-[#0a0a0a]" />
        </div>
      </div>

      {/* Right column: ONLINE, SYSTEM READY, terminal, Continue */}
      <div className="relative z-10 h-full w-full flex items-center px-6 md:px-12 lg:px-20">
        <div className="md:ml-auto md:w-[52%] lg:w-[48%] max-w-xl py-10">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> ONLINE
            </div>
            <div className="rounded-md border border-[#c5ff00]/40 px-4 py-2 inline-flex items-center gap-2 font-mono text-base md:text-lg text-[#c5ff00]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> &gt; SYSTEM READY
            </div>
          </motion.div>

          <motion.div initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-5 rounded-xl border border-white/10 bg-black/65 backdrop-blur-md overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 font-mono text-xs text-white/60">maria_kasycheva.sh</span>
            </div>
            <div className="px-5 py-5 font-mono text-[14.5px] md:text-[15px] leading-[1.65]">
              {lines.map((l, idx) => (
                <motion.p key={l.i} initial={{ opacity: 0, x: 6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + idx * 0.15 }}
                  className="flex gap-3 mb-3 last:mb-0">
                  <span className="text-white/30 select-none">{l.i}</span>
                  <span className="text-white/90">{highlight(l.text, l.hl)}</span>
                </motion.p>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-6 flex items-center justify-center">
            <button onClick={handleContinue}
              className="group inline-flex items-center gap-3 border border-[#c5ff00]/60 hover:bg-[#c5ff00] hover:text-black text-white px-8 py-3.5 rounded-full font-mono text-sm tracking-[0.2em] transition">
              CONTINUE <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>↓</motion.span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
