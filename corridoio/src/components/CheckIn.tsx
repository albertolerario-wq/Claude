import { useState } from 'react';
import type { NavProps } from '../App';

const QUESTIONS = [
  {
    id: 'sonno',
    label: 'Sonno',
    question: 'Stanotte hai dormito quanto?',
    low: 'pochissimo',
    high: 'benissimo',
  },
  {
    id: 'corpo',
    label: 'Corpo',
    question: 'Il corpo ha lavorato nelle ultime 24 ore?',
    low: 'per niente',
    high: 'molto',
    sub: 'camminata, sport, movimento',
  },
  {
    id: 'carico',
    label: 'Carico',
    question: 'Quante situazioni aperte e irrisolte porti adesso?',
    low: 'poche',
    high: 'moltissime',
    note: 'alta = peggio',
  },
  {
    id: 'phi',
    label: 'φ_rel',
    question: 'Oggi hai avuto contatto reale con qualcuno?',
    low: 'nessuno',
    high: 'molto presente',
  },
];

function Scale5({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 mt-3" role="radiogroup">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex-1 h-11 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === n
              ? 'bg-[#e8622a] text-white'
              : 'bg-[#f5f5f5] text-[#888] hover:bg-[#eeeeee]'
          }`}
          role="radio"
          aria-checked={value === n}
          aria-label={`Valore ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function CheckIn({ navigate, appState }: NavProps) {
  const { state, saveCheckin } = appState;
  const { mode, nickname } = state;

  const [values, setValues] = useState<Record<string, number | null>>({
    sonno: null, corpo: null, carico: null, phi: null,
  });
  const [phiGruppo, setPhiGruppo] = useState<boolean | null>(null);

  const allAnswered = QUESTIONS.every(q => values[q.id] !== null) &&
    (mode !== 'gruppo' || phiGruppo !== null);

  function handleSave() {
    if (!allAnswered) return;
    saveCheckin({
      sonno: values.sonno!,
      corpo: values.corpo!,
      carico: values.carico!,
      phi: values.phi!,
      phi_gruppo: phiGruppo ?? false,
      nickname: mode === 'gruppo' ? nickname : undefined,
    });
    navigate('home');
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 mb-2">
        <button
          onClick={() => navigate('home')}
          className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200"
          aria-label="Torna alla home"
        >
          ←
        </button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Check-in</h1>
        <span className="ml-auto text-xs text-[#aaa]">~60 secondi</span>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            className="bg-white rounded-lg p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#aaa] font-mono">{i + 1}/4</span>
              <span className="text-xs font-medium text-[#888] uppercase tracking-wider">{q.label}</span>
            </div>
            <p className="text-base text-[#1a1a1a] mt-1 leading-snug">{q.question}</p>
            {q.sub && <p className="text-xs text-[#aaa] mt-0.5">{q.sub}</p>}
            {q.note && <p className="text-xs text-[#c84b2a] mt-0.5">{q.note}</p>}
            <div className="flex justify-between mt-3 mb-1">
              <span className="text-xs text-[#aaa]">{q.low}</span>
              <span className="text-xs text-[#aaa]">{q.high}</span>
            </div>
            <Scale5
              value={values[q.id]}
              onChange={v => setValues(prev => ({ ...prev, [q.id]: v }))}
            />
          </div>
        ))}

        {/* Gruppo question */}
        {mode === 'gruppo' && (
          <div
            className="bg-white rounded-lg p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#aaa] font-mono">5/5</span>
              <span className="text-xs font-medium text-[#3d5a80] uppercase tracking-wider">Gruppo</span>
            </div>
            <p className="text-base text-[#1a1a1a] mt-1 leading-snug">
              Questa settimana hai avuto un contatto reale con qualcuno del gruppo?
            </p>
            <div className="flex gap-3 mt-3">
              {(['si', 'no'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setPhiGruppo(opt === 'si')}
                  className={`flex-1 h-11 rounded-lg text-sm font-medium transition-all duration-200 ${
                    (opt === 'si' && phiGruppo === true) || (opt === 'no' && phiGruppo === false)
                      ? 'bg-[#3d5a80] text-white'
                      : 'bg-[#f5f5f5] text-[#888] hover:bg-[#eee]'
                  }`}
                  aria-pressed={(opt === 'si' && phiGruppo === true) || (opt === 'no' && phiGruppo === false)}
                >
                  {opt === 'si' ? 'Sì' : 'No'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!allAnswered}
        className="w-full mt-6 py-3 bg-[#e8622a] text-white rounded-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity duration-200"
        aria-label="Salva check-in"
      >
        Salva
      </button>
    </div>
  );
}
