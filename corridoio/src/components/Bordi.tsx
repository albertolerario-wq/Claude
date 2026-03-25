import { useState } from 'react';
import type { NavProps } from '../App';
import { getDiagnosis } from '../hooks/useDiagnosis';
import { getRandomBordi } from '../data/bordi';

export default function Bordi({ navigate, appState }: NavProps) {
  const { state } = appState;
  const diagnosis = getDiagnosis(state.today);
  const [cards] = useState(() => getRandomBordi(3));

  const isLocked = diagnosis.bordiLocked ||
    (state.today !== null && (state.today.stabilita < 2.5 || state.today.loopEvents > 2));

  if (isLocked) {
    return (
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="flex items-center gap-3 py-4 mb-6">
          <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
          <h1 className="text-lg font-medium text-[#1a1a1a]">Bordi della mappa</h1>
        </div>
        <div className="bg-[#fde8e8] border border-[#e8b4a0] rounded-xl p-6 text-center">
          <div className="text-2xl mb-3">—</div>
          <p className="text-sm text-[#7d2d3a] leading-relaxed">
            Sistema ad alta attivazione. Questo modulo non è disponibile adesso.
          </p>
          <p className="text-sm text-[#7d2d3a] mt-2 leading-relaxed">
            Torna quando sei in zona verde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 py-4 mb-6">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Bordi della mappa</h1>
      </div>

      <div className="space-y-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-xl px-8 py-8"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <p
              className="text-xs text-[#aaa] uppercase tracking-widest mb-5"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {card.type}
            </p>
            <p
              className="text-xl leading-relaxed text-[#1a1a1a]"
              style={{ fontFamily: "'EB Garamond', Georgia, serif", fontWeight: 400 }}
            >
              {card.content}
            </p>
          </div>
        ))}
      </div>

      <p
        className="text-center text-xs text-[#aaa] mt-8 leading-relaxed"
        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
      >
        Queste non sono risposte. Sono posizioni abitabili ai bordi di quello che sappiamo.
      </p>
    </div>
  );
}
