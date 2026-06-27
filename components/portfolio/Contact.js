'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Send as SendIcon,
} from 'lucide-react';
import { useLang } from './LangContext';
import Reveal from './Reveal';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode';

const CONTACTS = [
  {
    key: 'email',
    value: 'kasycheva00@ukr.net',
    href: 'mailto:kasycheva00@ukr.net',
    icon: Mail,
    external: false,
  },
  {
    key: 'linkedin',
    value: 'in/maria-kasycheva',
    href: 'https://www.linkedin.com/in/maria-kasycheva/',
    icon: Linkedin,
    external: true,
  },
  {
    key: 'telegram',
    value: '@MariiaKas1',
    href: 'https://t.me/MariiaKas1',
    icon: MessageCircle,
    external: true,
  },
];

// Rect-based in-view detection. IntersectionObserver misreports below-fold
// elements in this layout (tall sticky hero + Lenis), so we read the real
// position on scroll — same approach as <Reveal/>. Re-triggers on re-entry.
function useInView(threshold = 0.85) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setInView(r.top < vh * threshold && r.bottom > vh * 0.1);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [threshold]);
  return [ref, inView];
}

// Mount-time media query — keeps the heavy Spline scene off small screens.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// Word-by-word entrance for the heading.
function AnimatedHeading({ text }) {
  const [ref, inView] = useInView(0.9);
  const words = text.split(' ');
  return (
    <h2
      ref={ref}
      className="mt-7 max-w-4xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.92] tracking-[-0.04em] text-white"
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-block"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(0.9em)',
              transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
              transitionDelay: `${i * 70}ms`,
              willChange: 'opacity, transform',
            }}
          >
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </h2>
  );
}

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState('idle');
  const [subRef, subInView] = useInView(0.92);
  const showRobot = useMediaQuery('(min-width: 1024px)');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status !== 'idle') setStatus('idle');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Contact request failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (_error) {
      setStatus('error');
    }
  };

  const backToTop = () => {
    window.dispatchEvent(new CustomEvent('hero:navigate', { detail: { target: '#top' } }));
  };

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-white/5 bg-[#080808] pt-20 sm:pt-24 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-[#c5ff00]/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute -right-52 bottom-0 h-[36rem] w-[36rem] rounded-full bg-white/[0.03] blur-[140px]" />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00]">{t.contact.kicker}</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5ff00]/25 bg-[#c5ff00]/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5ff00] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5ff00]" />
            </span>
            {t.contact.availability}
          </div>
        </div>

        <AnimatedHeading text={t.contact.heading} />

        <div
          ref={subRef}
          className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between"
          style={{
            opacity: subInView ? 1 : 0,
            transform: subInView ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
            transitionDelay: '220ms',
          }}
        >
          <p className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">{t.contact.sub}</p>
          <a
            href="mailto:kasycheva00@ukr.net"
            className="group inline-flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-[#c5ff00]"
          >
            {t.contact.direct}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          {/* Left: contact methods + resume + robot */}
          <Reveal className="flex flex-col gap-4" y={22}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONTACTS.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.key}
                    href={contact.href}
                    target={contact.external ? '_blank' : undefined}
                    rel={contact.external ? 'noreferrer noopener' : undefined}
                    className="group relative flex items-center gap-3.5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-[#c5ff00]/35 hover:bg-[#c5ff00]/[0.035]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-white/55 transition group-hover:border-[#c5ff00]/30 group-hover:text-[#c5ff00]">
                      <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.26em] text-white/35">
                        0{index + 1} / {t.contact[contact.key]}
                      </span>
                      <span className="mt-1 block truncate font-display text-[15px] text-white/85 transition group-hover:text-white sm:text-base">
                        {contact.value}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#c5ff00]" />
                  </a>
                );
              })}

              {/* Resume — accent card, deliberately the most visible item */}
              <a
                href="/assets/resume.pdf"
                download="AI Automation - Kasycheva Maria.pdf"
                className="group relative flex items-center gap-3.5 overflow-hidden rounded-xl border border-[#c5ff00]/40 bg-[#c5ff00]/[0.07] p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-[#c5ff00]/70 hover:bg-[#c5ff00]/[0.12]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c5ff00] text-black transition group-hover:scale-105">
                  <Download className="h-[17px] w-[17px]" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.26em] text-[#c5ff00]/80">
                    04 / PDF
                  </span>
                  <span className="mt-1 block truncate font-display text-[15px] font-medium text-white sm:text-base">
                    {t.contact.resume}
                  </span>
                </span>
                <Download className="h-4 w-4 shrink-0 text-[#c5ff00] transition group-hover:translate-y-1" />
              </a>
            </div>

            {/* Cute interactive robot — large screens only (heavy WebGL scene) */}
            {showRobot && (
              <div className="relative mt-1 hidden h-[260px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent lg:block xl:h-[300px]">
                <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="absolute inset-0 h-full w-full" />
                <span className="pointer-events-none absolute bottom-3 left-4 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {t.contact.robotHint}
                </span>
              </div>
            )}
          </Reveal>

          {/* Right: form */}
          <Reveal y={28}>
            <form
              onSubmit={submit}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-7 lg:p-8"
            >
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c5ff00]/60 to-transparent" />
              <div className="mb-6 flex items-start justify-between gap-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c5ff00]">{t.contact.formKicker}</div>
                  <h3 className="mt-2.5 font-display text-2xl leading-none text-white sm:text-3xl">{t.contact.formHeading}</h3>
                </div>
                <SendIcon className="h-6 w-6 shrink-0 text-white/20" strokeWidth={1.4} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="group block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">01 / {t.contact.name}</span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    value={form.name}
                    onChange={update('name')}
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-2.5 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                    placeholder={t.contact.namePlaceholder}
                  />
                </label>
                <label className="group block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">02 / {t.contact.email}</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    maxLength={160}
                    value={form.email}
                    onChange={update('email')}
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-2.5 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                    placeholder={t.contact.emailPlaceholder}
                  />
                </label>
              </div>

              <label className="mt-6 block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">03 / {t.contact.msg}</span>
                <textarea
                  required
                  name="message"
                  rows={4}
                  maxLength={4000}
                  value={form.message}
                  onChange={update('message')}
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-2.5 text-base leading-relaxed text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                  placeholder={t.contact.messagePlaceholder}
                />
              </label>

              <label className="absolute -left-[9999px]" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </label>

              <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5 text-xs font-mono" aria-live="polite">
                  {status === 'sent' && (
                    <span className="inline-flex items-center gap-2 text-[#c5ff00]">
                      <CheckCircle2 className="h-4 w-4" /> {t.contact.sent}
                    </span>
                  )}
                  {status === 'error' && <span className="text-red-300/85">{t.contact.error}</span>}
                </div>
                <button
                  disabled={status === 'sending'}
                  type="submit"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#c5ff00] px-6 text-sm font-medium text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:min-w-44"
                >
                  {status === 'sending' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.sending}</>
                  ) : (
                    <>{t.contact.send} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="mt-16 border-t border-white/10 py-6 sm:mt-20 sm:py-8">
          <div className="flex flex-col gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.footer.replace('2025', String(new Date().getFullYear()))}</span>
            <div className="flex items-center justify-between gap-8 sm:justify-end">
              <span>Oslo · Remote worldwide</span>
              <button
                type="button"
                onClick={backToTop}
                className="group inline-flex items-center gap-2 text-white/55 transition hover:text-[#c5ff00]"
              >
                {t.contact.backToTop}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#c5ff00]/40">
                  <ArrowUp className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
