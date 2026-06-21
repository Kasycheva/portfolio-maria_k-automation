'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { caseStudies } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

function Architecture({ tech }) {
  // Clean abstract architecture diagram (SVG)
  return (
    <div className="relative w-full h-72 md:h-96 rounded-2xl bg-gradient-to-br from-[#0f0f0f] to-[#161616] border border-white/10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stopColor="#c5ff00" stopOpacity="0.7"/><stop offset="1" stopColor="#c5ff00" stopOpacity="0.1"/></linearGradient>
        </defs>
        {/* Edges */}
        <path d="M120,200 C220,200 220,80 320,80" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        <path d="M120,200 C220,200 220,200 320,200" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        <path d="M120,200 C220,200 220,320 320,320" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        <path d="M460,80 C560,80 560,200 660,200" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        <path d="M460,200 L660,200" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        <path d="M460,320 C560,320 560,200 660,200" stroke="url(#edge)" strokeWidth="1.5" fill="none"/>
        {/* Nodes */}
        {[[120,200,'Input'],[320,80,tech[0]||'Step A'],[320,200,tech[1]||'Step B'],[320,320,tech[2]||'Step C'],[660,200,'Output']].map(([x,y,label],i)=> (
          <g key={i}>
            <rect x={x-60} y={y-22} width="120" height="44" rx="22" fill="#0a0a0a" stroke="#c5ff00" strokeOpacity={i===0||i===4?0.9:0.35} />
            <text x={x} y={y+5} fontFamily="ui-monospace,monospace" fontSize="12" fill="#f5f5f0" textAnchor="middle">{label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">/ architecture · placeholder</div>
    </div>
  );
}

export default function CaseStudies() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(null);
  return (
    <section id="cases" className="relative py-32 md:py-40 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.cases.kicker}</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-3xl">{t.cases.heading}</h2>
          <p className="text-white/55 max-w-md">{t.cases.sub}</p>
        </div>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {caseStudies.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              onClick={() => setActive(c)}
              className="group relative text-left rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-6 overflow-hidden hover:border-[#c5ff00]/60 transition">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#c5ff00]/0 group-hover:bg-[#c5ff00]/10 blur-2xl transition" />
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/40">CASE / {String(i+1).padStart(2,'0')}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl leading-tight">{lang==='ua' ? c.title_ua : c.title_en}</h3>
              <p className="mt-3 text-sm text-white/55 line-clamp-3">{lang==='ua' ? c.desc_ua : c.desc_en}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {c.tech.slice(0,4).map((tg) => (
                  <span key={tg} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 text-white/65">{tg}</span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-[#c5ff00] inline-flex items-center gap-2">{t.cases.view} <span className="group-hover:translate-x-1 transition">→</span></span>
                <span className="text-white/40 font-mono text-[10px]">{t.cases.explore}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)} data-lenis-prevent
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-10 overflow-y-auto">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 md:p-10 my-10">
              <button onClick={() => setActive(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 text-white/70 hover:bg-white/10">✕</button>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{active.emoji}</span>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-[#c5ff00]">CASE STUDY</div>
                  <h3 className="font-display text-3xl md:text-4xl mt-1">{lang==='ua' ? active.title_ua : active.title_en}</h3>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-[#c5ff00] font-mono text-xs tracking-[0.25em]">🔻 {t.cases.problem.toUpperCase()}</div>
                  <p className="mt-3 text-white/75">{lang==='ua' ? active.problem_ua : active.problem_en}</p>
                  <div className="mt-6 text-[#c5ff00] font-mono text-xs tracking-[0.25em]">🚀 {t.cases.solution.toUpperCase()}</div>
                  <p className="mt-3 text-white/75">{lang==='ua' ? active.solution_ua : active.solution_en}</p>
                  <div className="mt-6 text-[#c5ff00] font-mono text-xs tracking-[0.25em]">🧰 {t.cases.inside.toUpperCase()}</div>
                  <ul className="mt-3 space-y-1.5 text-white/75 text-sm">{active.inside.map((x) => <li key={x}>• {x}</li>)}</ul>
                </div>
                <div>
                  <div className="text-[#c5ff00] font-mono text-xs tracking-[0.25em]">⚙️ {t.cases.tech.toUpperCase()}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {active.tech.map((tg) => <span key={tg} className="text-xs font-mono px-2.5 py-1 rounded-full border border-white/15 text-white/80">{tg}</span>)}
                  </div>
                  <div className="mt-6 text-[#c5ff00] font-mono text-xs tracking-[0.25em]">📋 {t.cases.req.toUpperCase()}</div>
                  <ul className="mt-3 space-y-1.5 text-white/75 text-sm">{active.req.map((x) => <li key={x}>• {x}</li>)}</ul>
                  <div className="mt-6 text-[#c5ff00] font-mono text-xs tracking-[0.25em]">📈 {t.cases.impact.toUpperCase()}</div>
                  <ul className="mt-3 space-y-1.5 text-white/75 text-sm">{active.impact.map((x) => <li key={x}>• {x}</li>)}</ul>
                </div>
              </div>

              <div className="mt-10">
                <div className="text-[#c5ff00] font-mono text-xs tracking-[0.25em] mb-3">🗺️ {t.cases.arch.toUpperCase()}</div>
                <Architecture tech={active.tech} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
