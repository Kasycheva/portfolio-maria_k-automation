'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
  const { lang, setLang, t } = useLang();
  const [active, setActive] = useState('about');
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ids = ['about', 'skills', 'cases', 'workflow', 'ai', 'contact'];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const firstSection = document.getElementById('about');
      setPastHero(Boolean(firstSection && y >= firstSection.offsetTop - 2));
      const yp = y + 140;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= yp) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The burger menu freezes the page behind it, same as the case modal.
  useEffect(() => {
    if (!menuOpen) return undefined;
    window.dispatchEvent(new CustomEvent('lenis:stop'));
    return () => window.dispatchEvent(new CustomEvent('lenis:start'));
  }, [menuOpen]);

  // The menu only exists past the hero — close it if the user scrolls back up.
  useEffect(() => {
    if (!pastHero) setMenuOpen(false);
  }, [pastHero]);

  const goTo = (target) => {
    setMenuOpen(false);
    // Wait one beat so the menu unmount restarts Lenis (lenis:start) before
    // asking it to scroll — a stopped Lenis can't move a frozen page.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hero:navigate', { detail: { target } }));
    }, 80);
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between text-white transition-colors duration-300 ${
          pastHero || menuOpen
            ? 'bg-[#0a0a0a]/70 backdrop-blur-md border-b border-white/10'
            : 'mix-blend-difference'
        }`}>
        <a href="#top" className="font-display text-sm tracking-[0.2em] uppercase">M.K — <span className="opacity-60">AI Automation</span></a>

        {/* Desktop nav — unchanged; tablet and phone use the burger below. */}
        <AnimatePresence>
          {pastHero && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
              className="hidden lg:flex items-center gap-7 font-mono text-[11px] tracking-[0.18em] uppercase">
              {t.nav.items.map((it, i) => (
                <a key={it} href={`#${ids[i]}`} className={`whitespace-nowrap transition ${active === ids[i] ? 'opacity-100' : 'opacity-55 hover:opacity-100'}`}>
                  {it}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-xs">
            <button onClick={() => setLang('ua')} className={`px-2 py-1 transition ${lang==='ua' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>UA</button>
            <span className="opacity-40">|</span>
            <button onClick={() => setLang('en')} className={`px-2 py-1 transition ${lang==='en' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>EN</button>
          </div>

          {/* Burger — tablet & phone, appears once the hero is passed. */}
          <AnimatePresence>
            {pastHero && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.3 }}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:border-[#c5ff00]/50 lg:hidden"
              >
                <span
                  className={`absolute h-px w-4 bg-current transition-transform duration-300 ${
                    menuOpen ? 'rotate-45' : '-translate-y-[3.5px]'
                  }`}
                />
                <span
                  className={`absolute h-px w-4 bg-current transition-transform duration-300 ${
                    menuOpen ? '-rotate-45' : 'translate-y-[3.5px]'
                  }`}
                />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Full-screen menu — tablet & phone only. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a]/95 backdrop-blur-xl lg:hidden"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-[0.14]" />
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-2/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#c5ff00]/[0.05] blur-[120px]" />

            <nav className="relative flex flex-1 flex-col items-center justify-center gap-1 px-8">
              <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c5ff00]/70">MENU</div>
              {t.nav.items.map((it, i) => {
                const [num, ...rest] = it.split(' ');
                return (
                  <motion.button
                    key={it}
                    type="button"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => goTo(`#${ids[i]}`)}
                    className={`group flex w-full max-w-xs items-baseline justify-center gap-3 border-b border-white/[0.07] py-4 font-mono uppercase transition ${
                      active === ids[i] ? 'text-white' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    <span className={`text-[10px] tracking-[0.2em] ${active === ids[i] ? 'text-[#c5ff00]' : 'text-white/30'}`}>{num}</span>
                    <span className="text-sm tracking-[0.24em]">{rest.join(' ')}</span>
                  </motion.button>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
              className="relative pb-10 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/30"
            >
              M.K — AI Automation
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
