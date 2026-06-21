'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ visible }) {
  const { lang, setLang, t } = useLang();
  const [active, setActive] = useState('about');

  useEffect(() => {
    if (!visible) return;
    const ids = ['about', 'skills', 'cases', 'workflow', 'ai', 'contact'];
    const onScroll = () => {
      const y = window.scrollY + 120;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [visible]);

  const ids = ['about', 'skills', 'cases', 'workflow', 'ai', 'contact'];

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0a0a]/70 border-b border-white/5">
          <div className="px-6 md:px-10 lg:px-14 py-3 flex items-center justify-between gap-4">
            <a href="#top" className="font-mono text-xs tracking-[0.2em] uppercase text-white/85 shrink-0">
              M.K — <span className="opacity-50">AI Automation</span>
            </a>
            <nav className="hidden md:flex items-center gap-5 lg:gap-7 font-mono text-[11px] tracking-[0.18em] uppercase">
              {t.nav.items.map((it, i) => (
                <a key={it} href={`#${ids[i]}`}
                  className={`transition ${active === ids[i] ? 'text-[#c5ff00]' : 'text-white/55 hover:text-white'}`}>
                  {it}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1 font-mono text-xs shrink-0">
              <button onClick={() => setLang('ua')} className={`px-2 py-1 transition ${lang==='ua' ? 'text-[#c5ff00]' : 'text-white/55 hover:text-white'}`}>UA</button>
              <span className="text-white/30">|</span>
              <button onClick={() => setLang('en')} className={`px-2 py-1 transition ${lang==='en' ? 'text-[#c5ff00]' : 'text-white/55 hover:text-white'}`}>EN</button>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
