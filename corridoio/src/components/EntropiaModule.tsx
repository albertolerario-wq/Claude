import { useState } from 'react';
import type { NavProps } from '../App';

const PRIORITIES = [
  {
    label: 'Sonno',
    desc: '7-9 ore. Non recuperabile completamente a posteriori. Degrada tutto il resto.',
  },
  {
    label: 'Corpo',
    desc: 'Movimento quotidiano. Non sport necessariamente — camminata, scale, fisicità.',
  },
  {
    label: 'Carico allostatico',
    desc: 'Situazioni aperte, decisioni rimaste in sospeso, input ad alta salienza non elaborati.',
  },
];

const SABOTAGES = [
  { label: 'Alcol', desc: 'Degrada la qualità del sonno anche in quantità moderate.' },
  { label: 'Scrolling notturno', desc: 'Input ad alta salienza prima del sonno. Attiva il sistema.' },
  { label: 'Input ad alta salienza in stato attivato', desc: 'Notizie, conversazioni difficili, contenuti emotivamente carichi quando il sistema è già instabile.' },
];

function MiniBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#888] w-12 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#eee] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#e8622a] rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs text-[#aaa] w-4 text-right">{value}</span>
    </div>
  );
}

export default function EntropiaModule({ navigate, appState }: NavProps) {
  const { state } = appState;
  const { log } = state;
  const [loopText, setLoopText] = useState('');

  const last7 = log.slice(0, 7).reverse();

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 mb-2">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Entropia</h1>
        <span className="ml-auto text-xs text-[#aaa]">substrato fisico</span>
      </div>

      {/* Priorities */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Priorità assolute</h2>
        <div className="space-y-4">
          {PRIORITIES.map(p => (
            <div key={p.label}>
              <div className="text-sm font-medium text-[#1a1a1a] mb-1">{p.label}</div>
              <p className="text-xs text-[#888] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sabotage */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#c84b2a] uppercase tracking-wider mb-3">Sabotaggio diretto</h2>
        <div className="space-y-4">
          {SABOTAGES.map(s => (
            <div key={s.label}>
              <div className="text-sm font-medium text-[#1a1a1a] mb-1">{s.label}</div>
              <p className="text-xs text-[#888] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day mini log */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Ultimi 7 giorni</h2>
        {last7.length === 0 ? (
          <p className="text-xs text-[#aaa]">Nessun dato</p>
        ) : (
          <div className="space-y-3">
            {last7.map(entry => (
              <div key={entry.date}>
                <div className="text-xs text-[#aaa] mb-1.5">
                  {new Date(entry.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="space-y-1">
                  <MiniBar label="Sonno" value={entry.sonno} />
                  <MiniBar label="Corpo" value={entry.corpo} />
                  <MiniBar label="Carico" value={entry.carico} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loop aperti — not saved */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-1">Loop aperti</h2>
        <p className="text-xs text-[#aaa] mb-3">Esternalizza situazioni irrisolte. Non salvato.</p>
        <textarea
          value={loopText}
          onChange={e => setLoopText(e.target.value)}
          placeholder=""
          className="w-full h-28 text-sm text-[#1a1a1a] bg-[#fafafa] rounded-lg p-3 resize-none border border-[#eee] outline-none leading-relaxed"
          aria-label="Loop aperti — scrittura libera non salvata"
        />
      </div>
    </div>
  );
}
