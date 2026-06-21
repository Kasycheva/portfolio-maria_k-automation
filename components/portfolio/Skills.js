'use client';
import { useLang } from './LangContext';
import { skillTags, learning } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function Skills() {
  const { t } = useLang();
  const row = [...skillTags, ...skillTags];
  return (
    <section id="skills" className="relative py-32 md:py-40 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.skills.kicker}</div>
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">{t.skills.heading}</h2>
      </div>
      <div className="mt-16 overflow-hidden py-6 border-y border-white/10 bg-white/[0.02]">
        <div className="marquee gap-3 px-3">
          {row.map((s, i) => (
            <span key={i} className="shrink-0 font-display text-2xl md:text-3xl px-5 py-2 mx-1 text-white/85 whitespace-nowrap">{s}<span className="text-[#c5ff00] ml-4">◆</span></span>
          ))}
        </div>
      </div>
      <div className="mt-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border border-white/10 rounded-2xl px-6 py-5 bg-white/[0.02]">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">{t.skills.learning}</div>
          <div className="flex flex-wrap gap-2">
            {learning.map((l) => (
              <span key={l} className="font-display text-xl md:text-2xl text-[#c5ff00]">{l}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
