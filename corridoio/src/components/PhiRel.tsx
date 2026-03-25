import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { NavProps } from '../App';
import { getGroupDiagnosis } from '../hooks/useDiagnosis';

const QUESTIONS = [
  'Con chi hai avuto contatto reale questa settimana?',
  'Quale relazione ha richiesto presenza autentica — non performance?',
  'Cosa hai costruito o pensato insieme a qualcuno?',
];

export default function PhiRel({ navigate, appState }: NavProps) {
  const { state } = appState;
  const { log, mode, groupImports } = state;
  const [answers, setAnswers] = useState(['', '', '']);

  const last14 = log.slice(0, 14).reverse().map(e => ({
    date: e.date.slice(5),
    phi: e.phi,
  }));

  // Isolation detection in group mode
  let isolatedMembers: string[] = [];
  if (mode === 'gruppo' && groupImports.length > 0) {
    // Check last 2 weeks of imports
    const recentImports = groupImports.slice(-2).flat();
    const groupDx = getGroupDiagnosis(recentImports);
    isolatedMembers = groupDx.isolatedMembers.filter(Boolean);
  }

  // Compute phi index from log (14-day avg)
  const phiAvg = last14.length > 0
    ? last14.reduce((s, d) => s + d.phi, 0) / last14.length
    : 0;

  function phiDesc(avg: number) {
    if (avg >= 4) return 'Integrazione relazionale alta. Contatti reali frequenti nelle ultime due settimane.';
    if (avg >= 3) return 'Integrazione relazionale presente. Qualche contatto significativo.';
    if (avg >= 2) return 'Integrazione relazionale ridotta. Contatti sporadici o superficiali.';
    return 'Integrazione relazionale bassa. Presenza assente o quasi.';
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 py-4 mb-2">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">φ_rel</h1>
        <span className="ml-auto text-xs text-[#aaa]">integrazione relazionale</span>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <div key={i}>
              <p className="text-sm text-[#1a1a1a] mb-2 leading-snug">{q}</p>
              <textarea
                value={answers[i]}
                onChange={e => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                className="w-full h-16 text-sm text-[#1a1a1a] bg-[#fafafa] rounded-lg p-2.5 resize-none border border-[#eee] outline-none leading-relaxed"
                aria-label={`Risposta domanda ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Index */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">Indice φ_rel (14 giorni)</h2>
          <span className="text-lg font-light text-[#e8622a]">{phiAvg.toFixed(1)}</span>
        </div>
        <p className="text-xs text-[#666] leading-relaxed mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
          {phiDesc(phiAvg)}
        </p>

        {/* Sparkline */}
        {last14.length > 0 ? (
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={last14} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [typeof v === 'number' ? v.toFixed(1) : '-', 'φ']}
              />
              <Line type="monotone" dataKey="phi" stroke="#e8622a" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-[#aaa]">Nessun dato</p>
        )}
      </div>

      {/* Group isolation alerts */}
      {mode === 'gruppo' && isolatedMembers.length > 0 && (
        <div className="bg-[#fff8f0] border border-[#f5d9c0] rounded-xl p-4">
          <h2 className="text-xs font-medium text-[#c8860a] uppercase tracking-wider mb-2">Contatti assenti</h2>
          {isolatedMembers.map(name => (
            <p key={name} className="text-sm text-[#666]">
              Manca un contatto con <strong>{name}</strong> da un po'.
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
