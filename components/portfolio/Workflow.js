'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';

const STAGES = [
  {
    id: 'trigger',
    label: { en: 'Trigger', ua: 'Тригер' },
    verb: { en: 'Receive', ua: 'Отримати' },
    desc: {
      en: 'The workflow wakes up when something happens: a form is submitted, an email arrives, a schedule fires, or another app sends a webhook.',
      ua: 'Воркфлоу прокидається, коли щось відбувається: надсилається форма, приходить лист, спрацьовує розклад або інший застосунок шле вебхук.',
    },
    input: { en: 'Form, email, schedule, webhook', ua: 'Форма, лист, розклад, вебхук' },
    output: { en: 'A normalized event with a process ID', ua: 'Нормалізована подія з ID процесу' },
    logic: { en: 'Validate the source, clean the fields, and start a traceable run.', ua: 'Перевірити джерело, очистити поля й запустити відстежуваний процес.' },
    tools: ['Webhook', 'Forms', 'Cron'],
  },
  {
    id: 'enrich',
    label: { en: 'Enrich', ua: 'Збагачення' },
    verb: { en: 'Add context', ua: 'Додати контекст' },
    desc: {
      en: 'Raw input becomes useful context. The workflow looks up records, opens files, and pulls supporting data from connected systems.',
      ua: 'Сирий вхід перетворюється на корисний контекст. Воркфлоу знаходить записи, відкриває файли й підтягує дані з підключених систем.',
    },
    input: { en: 'The incoming event and its identifiers', ua: 'Вхідна подія та її ідентифікатори' },
    output: { en: 'A context-rich record ready for analysis', ua: 'Збагачений запис, готовий до аналізу' },
    logic: { en: 'Match IDs, merge sources, and remove duplicate or incomplete data.', ua: 'Зіставити ID, об’єднати джерела та прибрати дублікати й неповні дані.' },
    tools: ['Airtable', 'REST APIs', 'Drive'],
  },
  {
    id: 'decide',
    label: { en: 'AI decision', ua: 'AI-рішення' },
    verb: { en: 'Understand', ua: 'Зрозуміти' },
    desc: {
      en: 'AI reads the context, classifies what it means, and proposes the next best action with a confidence score.',
      ua: 'AI читає контекст, визначає його значення та пропонує наступну найкращу дію з рівнем упевненості.',
    },
    input: { en: 'Clean data, documents, and business context', ua: 'Чисті дані, документи та бізнес-контекст' },
    output: { en: 'Decision, category, priority, confidence', ua: 'Рішення, категорія, пріоритет, упевненість' },
    logic: { en: 'Prompt the model, validate structured output, and apply safety thresholds.', ua: 'Передати запит моделі, перевірити структуровану відповідь і застосувати пороги безпеки.' },
    tools: ['OpenAI', 'Claude', 'Gemini'],
  },
  {
    id: 'route',
    label: { en: 'Route', ua: 'Маршрут' },
    verb: { en: 'Choose path', ua: 'Обрати шлях' },
    desc: {
      en: 'Rules direct every case to the right branch according to type, priority, value, risk, or confidence.',
      ua: 'Правила направляють кожен випадок у потрібну гілку за типом, пріоритетом, цінністю, ризиком або впевненістю.',
    },
    input: { en: 'The AI decision and business rules', ua: 'AI-рішення та бізнес-правила' },
    output: { en: 'A selected destination and action plan', ua: 'Обраний напрям і план дій' },
    logic: { en: 'Evaluate conditions, handle exceptions, and escalate uncertain cases.', ua: 'Перевірити умови, обробити винятки й передати невизначені випадки людині.' },
    tools: ['n8n', 'Make.com', 'Rules'],
  },
  {
    id: 'act',
    label: { en: 'Act', ua: 'Дія' },
    verb: { en: 'Execute', ua: 'Виконати' },
    desc: {
      en: 'The system performs the useful work: sends a reply, creates a record, drafts a document, or asks a person for approval.',
      ua: 'Система виконує корисну роботу: надсилає відповідь, створює запис, готує документ або просить людину про підтвердження.',
    },
    input: { en: 'The routed task and prepared payload', ua: 'Маршрутизоване завдання й підготовлені дані' },
    output: { en: 'A completed action or approval request', ua: 'Виконана дія або запит на підтвердження' },
    logic: { en: 'Call the right integration, retry safely, and keep a human in the loop where needed.', ua: 'Викликати потрібну інтеграцію, безпечно повторити спробу й залучити людину там, де це потрібно.' },
    tools: ['Gmail', 'Slack', 'Telegram'],
  },
  {
    id: 'sync',
    label: { en: 'Sync', ua: 'Синхронізація' },
    verb: { en: 'Close loop', ua: 'Замкнути цикл' },
    desc: {
      en: 'The result is written back to the systems your team already uses, leaving one reliable source of truth.',
      ua: 'Результат записується назад у системи, якими вже користується команда, залишаючи єдине надійне джерело правди.',
    },
    input: { en: 'Action result, status, and audit trail', ua: 'Результат дії, статус та історія процесу' },
    output: { en: 'Updated CRM, table, workspace, and metrics', ua: 'Оновлені CRM, таблиця, робочий простір і метрики' },
    logic: { en: 'Write back the result, log the run, notify owners, and expose performance data.', ua: 'Записати результат, зберегти лог, сповістити відповідальних і відкрити дані про ефективність.' },
    tools: ['CRM', 'Sheets', 'Notion'],
  },
];

const NODE_POSITIONS = [
  { x: 12, y: 30 },
  { x: 27, y: 64 },
  { x: 43, y: 30 },
  { x: 58, y: 64 },
  { x: 74, y: 30 },
  { x: 88, y: 64 },
];

const PATH_POINTS = '120,126 270,269 430,126 580,269 740,126 880,269';

export default function Workflow() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const L = (value) => (lang === 'ua' ? value.ua : value.en);
  const stage = STAGES[selected];
  const progress = (selected / (STAGES.length - 1)) * 100;
  const packet = NODE_POSITIONS[selected];
  const mapScrollRef = useRef(null);

  // On phones the map is wider than the screen and scrolls sideways — keep the
  // active node (and the travelling packet) in frame as the flow advances.
  // Hand-rolled rAF tween: native smooth scrollTo gets its target overridden
  // when stage changes arrive faster than the animation finishes.
  useEffect(() => {
    const scroller = mapScrollRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth + 4) return undefined;
    const start = scroller.scrollLeft;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const target = Math.max(0, Math.min(
      (NODE_POSITIONS[selected].x / 100) * scroller.scrollWidth - scroller.clientWidth / 2,
      max
    ));
    if (Math.abs(target - start) < 2) return undefined;
    if (reduceMotion) {
      scroller.scrollLeft = target;
      return undefined;
    }
    let frame = null;
    const t0 = performance.now();
    const duration = 520;
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      scroller.scrollLeft = start + (target - start) * ease(p);
      if (p < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => { if (frame !== null) window.cancelAnimationFrame(frame); };
  }, [selected, reduceMotion]);

  useEffect(() => {
    if (!playing) return;
    if (selected >= STAGES.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setSelected((value) => value + 1), reduceMotion ? 450 : 1150);
    return () => window.clearTimeout(timer);
  }, [playing, selected, reduceMotion]);

  const selectStage = (index) => {
    setPlaying(false);
    setSelected(index);
  };

  const togglePlayback = () => {
    if (!playing && selected === STAGES.length - 1) setSelected(0);
    setPlaying((value) => !value);
  };

  return (
    <section id="workflow" className="relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <Reveal variant="heading" y={44}>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] max-lg:text-center">{t.workflow.kicker}</div>
          <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
            <h2 className="max-w-3xl font-serif text-5xl leading-[0.92] tracking-tight sm:text-6xl lg:text-[5.4rem] max-lg:mx-auto max-lg:text-center">
              {t.workflow.heading}
            </h2>
            <div className="max-w-xl lg:pb-2 max-lg:mx-auto max-lg:text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/35">{t.workflow.definitionLabel}</div>
              <p className="mt-3 text-base leading-relaxed text-white/60 sm:text-lg">{t.workflow.sub}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-6">
          <AnimatePresence mode="wait">
            <motion.aside
              key={stage.id}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[1.5rem] border border-white/10 bg-[#0c0c0c] p-6 sm:p-8 max-lg:order-2"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#c5ff00]">{t.workflow.inspectorLabel}</span>
                <span className="font-mono text-[10px] text-white/30">{String(selected + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</span>
              </div>

              <div className="mt-7 font-serif text-4xl text-white sm:text-5xl max-lg:text-center">{L(stage.label)}</div>
              <p className="mt-4 text-base leading-relaxed text-white/65 max-lg:text-center">{L(stage.desc)}</p>

              <dl className="mt-8 space-y-5 border-t border-white/10 pt-6 max-lg:text-center">
                {[
                  [t.workflow.inputLabel, stage.input],
                  [t.workflow.outputLabel, stage.output],
                  [t.workflow.logicLabel, stage.logic],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">{label}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-white/75">{L(value)}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 max-lg:text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">{t.workflow.toolsLabel}</div>
                <div className="mt-3 flex flex-wrap gap-2 max-lg:justify-center">
                  {stage.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] text-white/65">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.aside>
          </AnimatePresence>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090909] max-lg:order-1">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/30">{t.workflow.mapLabel}</div>
                <div className="mt-1 font-mono text-xs text-white/60">{L(stage.verb)} → {L(stage.label)}</div>
              </div>
              <button
                type="button"
                onClick={togglePlayback}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 transition hover:border-[#c5ff00]/50 hover:text-[#c5ff00]"
              >
                <span aria-hidden>{playing ? 'Ⅱ' : '▶'}</span>
                {playing ? t.workflow.pauseLabel : t.workflow.playLabel}
              </button>
            </div>

            <div ref={mapScrollRef} className="overflow-x-auto">
              <div className="relative h-[430px] min-w-[760px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.085)_1px,transparent_1px)] [background-size:22px_22px] md:min-w-0">
                <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1000 420" preserveAspectRatio="none">
                  <polyline
                    points={PATH_POINTS}
                    fill="none"
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth="1.5"
                    strokeDasharray="6 9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <motion.polyline
                    points={PATH_POINTS}
                    fill="none"
                    stroke="#c5ff00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                    initial={false}
                    animate={{ strokeDasharray: `${progress} 100` }}
                    transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(197,255,0,0.45))' }}
                  />
                </svg>

                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c5ff00] shadow-[0_0_18px_rgba(197,255,0,0.9)]"
                  animate={{ left: `${packet.x}%`, top: `${packet.y}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                />

                {STAGES.map((item, index) => {
                  const position = NODE_POSITIONS[index];
                  const active = index === selected;
                  const complete = index < selected;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectStage(index)}
                      aria-pressed={active}
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      className={`group absolute z-10 w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-4 py-3 text-left backdrop-blur-sm transition duration-300 ${
                        active
                          ? 'border-[#c5ff00]/70 bg-[#c5ff00]/10 shadow-[0_0_30px_rgba(197,255,0,0.1)]'
                          : complete
                            ? 'border-white/20 bg-black/80'
                            : 'border-white/10 bg-black/70 hover:border-white/30'
                      }`}
                    >
                      <div className={`font-mono text-[9px] ${active || complete ? 'text-[#c5ff00]' : 'text-white/25'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className={`mt-1.5 font-mono text-xs ${active ? 'text-white' : 'text-white/65'}`}>{L(item.label)}</div>
                      <div className="mt-1 truncate text-[10px] text-white/30">{L(item.verb)}</div>
                    </button>
                  );
                })}

                <div className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">
                  {t.workflow.hintLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
