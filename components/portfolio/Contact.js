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
  // Start loading the Spline scene ~1 viewport before the footer enters, and
  // never unmount it afterwards — remounting refetches and reparses the whole
  // scene, which is why the robot used to appear with a long delay.
  const [robotRef, robotNear] = useInView(2.2);
  const showRobot = useMediaQuery('(min-width: 1024px)');
  const [robotReady, setRobotReady] = useState(false);
  useEffect(() => {
    if (robotNear && showRobot) setRobotReady(true);
  }, [robotNear, showRobot]);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = async () => {
    const address = CONTACTS.find((c) => c.key === 'email')?.value ?? '';
    try {
      await navigator.clipboard.writeText(address);
    } catch (_error) {
      // Clipboard API unavailable (older/insecure context) — fall back to mailto.
      window.location.href = `mailto:${address}`;
      return;
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

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

        <Reveal className="relative mt-10 lg:mt-16" y={24}>
          <div className="grid items-stretch lg:min-h-[560px] lg:grid-cols-[1fr_0.82fr_1.18fr] lg:gap-12 xl:gap-16">
            {/* Contact directory — the visual anchor of the section. */}
            <div className="p-5 sm:p-7 lg:px-0 lg:py-8">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c5ff00]/70">{t.contact.directory}</span>
              </div>
              <div>
              {CONTACTS.map((contact, index) => {
                const Icon = contact.icon;
                const isEmail = contact.key === 'email';
                const showCopied = isEmail && copiedEmail;
                const rowClass =
                  'group flex w-full items-center gap-5 border-b border-white/[0.08] py-6 text-left transition-colors hover:border-[#c5ff00]/25';
                const body = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#c5ff00]/70 transition group-hover:border-[#c5ff00]/40 group-hover:bg-[#c5ff00]/[0.05] group-hover:text-[#c5ff00]">
                      {showCopied ? (
                        <CheckCircle2 className="h-[17px] w-[17px] text-[#c5ff00]" strokeWidth={1.8} />
                      ) : (
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.26em] text-white/35">
                        0{index + 1} / {isEmail ? t.contact.copyEmail : t.contact[contact.key]}
                      </span>
                      <span className="mt-1.5 block truncate font-display text-[15px] text-white/80 transition group-hover:text-white sm:text-base">
                        {showCopied ? t.contact.copied : contact.value}
                      </span>
                    </span>
                  </>
                );
                return isEmail ? (
                  <button key={contact.key} type="button" onClick={copyEmail} className={rowClass}>
                    {body}
                  </button>
                ) : (
                  <a
                    key={contact.key}
                    href={contact.href}
                    target={contact.external ? '_blank' : undefined}
                    rel={contact.external ? 'noreferrer noopener' : undefined}
                    className={rowClass}
                  >
                    {body}
                  </a>
                );
              })}

              {/* Resume uses the same rhythm as the contact channels. */}
              <a
                href="/assets/resume.pdf"
                download="AI Automation - Kasycheva Maria.pdf"
                className="group flex items-center gap-5 border-b border-white/[0.08] py-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#c5ff00]/70 transition group-hover:border-[#c5ff00]/40 group-hover:bg-[#c5ff00]/[0.05] group-hover:text-[#c5ff00]">
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
              </a>
              </div>
            </div>

            {/* Robot standing on Earth horizon - clean, elegant. Earth glow shows
                from tablet (md) up; the heavy Spline robot stays desktop-only (lg),
                gated separately below via showRobot. */}
            <div className="relative z-10 hidden min-h-[590px] overflow-visible md:block">
              {/* Earth sphere - only the edge shows (minimalist horizon) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2"
                style={{ width: 0, height: 0 }}
              >
                <img
                  src="/images/earth-green-ready.png"
                  alt=""
                  draggable={false}
                  className="absolute left-1/2 max-w-none -translate-x-1/2 select-none"
                  style={{
                    top: '-420px',
                    width: '1200px',
                    height: 'auto',
                    opacity: 0.65,
                    filter: 'brightness(0.7) contrast(1.1) saturate(0.85)',
                    maskImage:
                      'radial-gradient(ellipse 35% 55% at 50% 52%, #000 0%, #000 35%, transparent 72%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 35% 55% at 50% 52%, #000 0%, #000 35%, transparent 72%)',
                  }}
                />
              </div>

              {/* Earth edge glow - subtle luminescence */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 z-5 -translate-x-1/2"
                style={{
                  width: '600px',
                  height: '300px',
                  background: 'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(197, 255, 0, 0.25), transparent 65%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Robot standing ON the Earth */}
              {showRobot && robotReady && (
                <InteractiveRobotSpline
                  scene={ROBOT_SCENE_URL}
                  className="absolute inset-0 z-10 h-full w-full grayscale saturate-0 opacity-92 brightness-[0.85] contrast-[1.03]"
                  style={{
                    transform: 'translateY(130px) scale(0.72, 0.84)',
                    clipPath: 'inset(0 0 70px 0)',
                  }}
                  fallback={null}
                  onLoad={(app) => {
                    try {
                      const objects =
                        typeof app.getAllObjects === 'function'
                          ? app.getAllObjects()
                          : ['Plane', 'Floor', 'Ground', 'Shadow'].map((name) =>
                              app.findObjectByName(name)
                            );
                      objects.forEach((obj) => {
                        if (obj && /plane|floor|ground|shadow/i.test(obj.name || '')) {
                          obj.visible = false;
                        }
                      });
                    } catch (_e) {
                      /* scene API unavailable — non-fatal */
                    }
                  }}
                />
              )}
            </div>

            {/* Form — a quiet editorial surface, not a competing card. */}
            <form
              onSubmit={submit}
              className="relative flex h-full flex-col p-5 sm:p-7 lg:px-0 lg:py-8"
            >
              <div className="mb-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c5ff00]/70">{t.contact.formKicker}</div>
                  <h3 className="mt-3 font-display text-3xl leading-none tracking-[-0.03em] text-white sm:text-4xl">
                    {t.contact.formHeading}
                  </h3>
                </div>
              </div>

              <div className="grid gap-5">
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

              <label className="mt-5 block lg:mt-[3.125rem]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">03 / {t.contact.msg}</span>
                <textarea
                  required
                  name="message"
                  rows={2}
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

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:-translate-y-4">
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

        <div className="relative z-30 mt-16 sm:mt-16">
          {/* Back-to-top sits above the divider so the footer line stays a clean
              single row even on narrow screens. */}
          <div className="flex justify-end pb-5">
            <button
              type="button"
              onClick={backToTop}
              className="group pointer-events-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 transition hover:text-[#c5ff00]"
            >
              {t.contact.backToTop}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#c5ff00]/40">
                <ArrowUp className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
          <div className="relative flex flex-col gap-3 border-t border-white/10 bg-[#080808] py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:py-8">
            <span>{t.footer.replace('2025', String(new Date().getFullYear()))}</span>
            <span>Remote worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
