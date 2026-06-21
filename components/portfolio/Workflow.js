'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { motion } from 'framer-motion';

const NODES = [
  { id: 'trigger', x: 80, y: 50, label: 'Trigger', purpose: 'Start of the workflow — webhook, schedule or form.', input: 'External event', output: 'Event payload', logic: 'Event listener with filter rules', tools: ['Webhook','Cron'] },
  { id: 'enrich', x: 320, y: 50, label: 'Enrich', purpose: 'Adds business context to the raw event.', input: 'Raw payload', output: 'Enriched record', logic: 'Lookups + API enrichment', tools: ['Airtable','REST APIs'] },
  { id: 'classify', x: 560, y: 50, label: 'AI Classify', purpose: 'Routes by intent/category using an LLM.', input: 'Enriched record', output: 'Category + confidence', logic: 'LLM with structured output', tools: ['OpenAI','Claude'] },
  { id: 'route', x: 320, y: 180, label: 'Route', purpose: 'Branches to the right path based on rules.', input: 'Category', output: 'Selected branch', logic: 'Decision table', tools: ['n8n','Make.com'] },
  { id: 'auto', x: 140, y: 320, label: 'Auto-resolve', purpose: 'Handles common cases without humans.', input: 'Branch A', output: 'Closed task', logic: 'Templated actions', tools: ['Gmail','Slack'] },
  { id: 'human', x: 500, y: 320, label: 'Human-in-loop', purpose: 'Sends edge cases to humans for review.', input: 'Branch B', output: 'Approved action', logic: 'Approval queue', tools: ['Telegram','Slack'] },
  { id: 'sync', x: 780, y: 180, label: 'Sync', purpose: 'Writes results back to systems of record.', input: 'Action result', output: 'Updated record', logic: 'Idempotent upsert', tools: ['CRM','Sheets'] },
];

const EDGES = [['trigger','enrich'],['enrich','classify'],['classify','route'],['route','auto'],['route','human'],['auto','sync'],['human','sync']];

export default function Workflow() {
  const { t } = useLang();
  const [selected, setSelected] = useState(NODES[2]);
  return (
    <section id="workflow" className="relative py-32 md:py-40 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.workflow.kicker}</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-3xl">{t.workflow.heading}</h2>
          <p className="text-white/55 max-w-md">{t.workflow.sub}</p>
        </div>
        <div className="mt-12 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 relative rounded-3xl bg-[#0c0c0c] border border-white/10 overflow-hidden h-[480px]">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <svg viewBox="0 0 900 420" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="wedge" x1="0" x2="1"><stop offset="0" stopColor="#c5ff00" stopOpacity="0.6"/><stop offset="1" stopColor="#c5ff00" stopOpacity="0.15"/></linearGradient>
              </defs>
              {EDGES.map(([a,b], i) => {
                const A = NODES.find(n=>n.id===a); const B = NODES.find(n=>n.id===b);
                const cx = (A.x+B.x)/2;
                return <path key={i} d={`M${A.x},${A.y} C${cx},${A.y} ${cx},${B.y} ${B.x},${B.y}`} stroke="url(#wedge)" strokeWidth="1.6" fill="none"/>;
              })}
              {NODES.map((n) => (
                <g key={n.id} onClick={() => setSelected(n)} className="cursor-pointer">
                  <rect x={n.x-70} y={n.y-22} width="140" height="44" rx="22"
                    fill={selected.id===n.id ? '#c5ff00' : '#0a0a0a'}
                    stroke={selected.id===n.id ? '#c5ff00' : '#ffffff30'} />
                  <text x={n.x} y={n.y+5} fontFamily="ui-monospace,monospace" fontSize="13" fontWeight="500"
                    fill={selected.id===n.id ? '#0a0a0a' : '#f5f5f0'} textAnchor="middle">{n.label}</text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">/ click any node to inspect</div>
          </div>
          <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="lg:col-span-4 rounded-3xl bg-[#0c0c0c] border border-white/10 p-6 md:p-8">
            <div className="font-mono text-[10px] tracking-[0.3em] text-[#c5ff00]">/ NODE</div>
            <h3 className="font-display text-3xl mt-2">{selected.label}</h3>
            <p className="mt-3 text-white/65 text-sm">{selected.purpose}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Input</dt><dd className="text-white/85">{selected.input}</dd></div>
              <div><dt className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Output</dt><dd className="text-white/85">{selected.output}</dd></div>
              <div><dt className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Logic</dt><dd className="text-white/85">{selected.logic}</dd></div>
              <div><dt className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Tools</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">{selected.tools.map(tt => <span key={tt} className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/15">{tt}</span>)}</dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
