'use client';
import { useLang } from './LangContext';
import { motion } from 'framer-motion';

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="relative py-32 md:py-40 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-10">{t.about.kicker}</motion.div>
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="md:col-span-5 md:sticky md:top-24">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#111]">
              <img src="/assets/maria-sunglasses.jpg" alt="Maria Kasycheva" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-white/10 rounded-2xl pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-white/70">
                <span>Operator</span><span>UA • EN</span>
              </div>
            </div>
          </motion.div>
          <div className="md:col-span-7">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">{t.about.heading}</motion.h2>
            <div className="mt-10 space-y-6 text-lg md:text-xl text-white/70 max-w-xl">
              {t.about.body.map((p, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }}>{p}</motion.p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {t.about.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/15 text-white/70">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
