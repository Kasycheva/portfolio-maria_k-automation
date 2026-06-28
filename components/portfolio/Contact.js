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
  const [robotRef, robotInView] = useInView(1.05);
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
    <footer id="contact" ref={robotRef} className="relative overflow-hidden border-t border-white/5 bg-[#080808] pt-20 sm:pt-24 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.12]" />
      <div className="pointer-events-none absolute -left-48 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#c5ff00]/[0.035] blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-px w-1/2 bg-gradient-to-l from-white/10 to-transparent" />

      <div className="relative mx-auto max-w-[1520px] px-4 sm:px-6 md:px-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00]">{t.contact.kicker}</div>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5ff00] opacity-35" />
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

        <Reveal className="relative mt-10 overflow-visible rounded-[2.25rem] border border-white/[0.09] bg-[#0a0a0a]/72 shadow-[0_35px_100px_rgba(0,0,0,0.28)] lg:mt-16" y={24}>
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="grid lg:min-h-[560px] lg:grid-cols-[0.72fr_0.8fr_1.18fr]">
            {/* Contact directory — the visual anchor of the section. */}
            <div className="p-5 sm:p-7 lg:px-9 lg:py-10">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">{t.contact.directory}</span>
                <span className="font-mono text-[10px] text-white/20">01—04</span>
              </div>
              <div>
              {CONTACTS.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.key}
                    href={contact.href}
                    target={contact.external ? '_blank' : undefined}
                    rel={contact.external ? 'noreferrer noopener' : undefined}
                    className="group flex items-center gap-4 border-b border-white/[0.08] py-5 transition-colors hover:border-[#c5ff00]/25"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-white/40 transition group-hover:text-[#c5ff00]">
                      <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.26em] text-white/35">
                        0{index + 1} / {t.contact[contact.key]}
                      </span>
                      <span className="mt-1.5 block truncate font-display text-[15px] text-white/80 transition group-hover:text-white sm:text-base">
                        {contact.value}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#c5ff00]" />
                  </a>
                );
              })}

              {/* Resume uses the same rhythm as the contact channels. */}
              <a
                href="/assets/resume.pdf"
                download="AI Automation - Kasycheva Maria.pdf"
                className="group flex items-center gap-4 py-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-white/40 transition group-hover:text-[#c5ff00]">
                  <Download className="h-[17px] w-[17px]" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.26em] text-white/40">
                    04 / PDF
                  </span>
                  <span className="mt-1.5 block truncate font-display text-[15px] text-white/80 transition group-hover:text-white sm:text-base">
                    {t.contact.resume}
                  </span>
                </span>
                <Download className="h-4 w-4 shrink-0 text-white/25 transition group-hover:translate-y-1 group-hover:text-[#c5ff00]" />
              </a>
              </div>
            </div>

            {/* The robot has a deliberate dock between information and action. */}
            <div className="relative z-10 -my-8 hidden min-h-[624px] overflow-visible rounded-[2rem] border border-white/[0.11] bg-[#090909] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] lg:block">
              <div className="pointer-events-none absolute -left-10 top-[2.35rem] h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
              <div className="pointer-events-none absolute -right-16 top-[2.35rem] h-px w-16 bg-gradient-to-r from-white/20 to-transparent" />
              <h3 className="pointer-events-none absolute right-6 top-5 z-20 font-display text-xl leading-none tracking-[-0.02em] text-white/75">
                {t.contact.formHeading}
              </h3>
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_42%,rgba(197,255,0,0.075),transparent_50%)]">
                <div
                  className="absolute inset-x-[-20%] bottom-[-18%] h-[48%] opacity-35"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(197,255,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(197,255,0,0.12) 1px, transparent 1px)',
                    backgroundSize: '38px 38px',
                    maskImage: 'linear-gradient(to top, black, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to top, black, transparent 80%)',
                    transform: 'perspective(420px) rotateX(64deg)',
                    transformOrigin: '50% 100%',
                  }}
                />
              </div>
              {showRobot && robotInView && (
                <InteractiveRobotSpline
                  scene={ROBOT_SCENE_URL}
                  className="absolute inset-0 h-full w-full scale-[0.88] hue-rotate-[165deg] saturate-[0.72] brightness-[0.94]"
                />
              )}
              {/* A quiet lower fade masks Spline chrome without adding another label. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 rounded-b-[2rem] bg-gradient-to-t from-[#090909] from-45% via-[#090909]/95 to-transparent" />
            </div>

            {/* Form — a quiet editorial surface, not a competing card. */}
            <form
              onSubmit={submit}
              className="relative flex h-full flex-col p-5 sm:p-7 lg:px-10 lg:py-10"
            >
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">{t.contact.formKicker}</div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/30">
                  <SendIcon className="h-4 w-4" strokeWidth={1.4} />
                </span>
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
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
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
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                    placeholder={t.contact.emailPlaceholder}
                  />
                </label>
              </div>

              <label className="mt-8 block lg:flex-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">03 / {t.contact.msg}</span>
                <textarea
                  required
                  name="message"
                  rows={4}
                  maxLength={4000}
                  value={form.message}
                  onChange={update('message')}
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-base leading-relaxed text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                  placeholder={t.contact.messagePlaceholder}
                />
              </label>

              <label className="absolute -left-[9999px]" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </label>

              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                  className="group inline-flex min-h-[54px] items-center justify-center gap-4 rounded-full border border-white/15 bg-white/[0.035] py-1.5 pl-6 pr-2 text-sm font-medium text-white transition hover:border-white/30 disabled:cursor-wait disabled:opacity-60 sm:min-w-52 sm:justify-between"
                >
                  {status === 'sending' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.sending}</>
                  ) : (
                    <>{t.contact.send} <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c5ff00] text-black transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Reveal>

        <div className="mt-16 border-t border-white/10 py-6 sm:mt-20 sm:py-8">
          <div className="flex flex-col gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.footer.replace('2025', String(new Date().getFullYear()))}</span>
            <div className="flex items-center justify-between gap-8 sm:justify-end">
              <span>Oslo · Remote worldwide</span>
              <button
                type="button"
                onClick={backToTop}
                className="group pointer-events-auto inline-flex items-center gap-2 text-white/55 transition hover:text-[#c5ff00]"
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
