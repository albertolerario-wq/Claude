import { useState, useEffect, useRef } from 'react';
import type { NavProps } from '../App';

const DURATION_SECONDS = 20 * 60;

type TimerState = 'idle' | 'running' | 'done';

export default function Slot({ navigate, appState }: NavProps) {
  const { state, saveNote } = appState;
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [text, setText] = useState(state.today?.note ?? '');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function fmt(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function start() {
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState('done');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('idle');
    setRemaining(DURATION_SECONDS);
  }

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function handleSave() {
    saveNote(text);
    navigate('home');
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 mb-4">
        <button
          onClick={() => navigate('home')}
          className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200"
          aria-label="Torna alla home"
        >
          ←
        </button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Slot</h1>
      </div>

      {/* Timer display */}
      <div className="bg-white rounded-xl p-8 mb-4 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div
          className="text-6xl font-light text-[#1a1a1a] mb-4 tabular-nums"
          aria-live="polite"
          aria-label={`Tempo rimanente: ${fmt(remaining)}`}
        >
          {fmt(remaining)}
        </div>

        {timerState === 'idle' && (
          <div>
            <p className="text-sm text-[#888] mb-4">premi avvia</p>
            <button
              onClick={start}
              className="px-8 py-3 bg-[#e8622a] text-white rounded-lg text-sm font-medium hover:bg-[#d45520] transition-colors duration-200"
              aria-label="Avvia timer 20 minuti"
            >
              Avvia
            </button>
          </div>
        )}

        {timerState === 'running' && (
          <div>
            <p className="text-sm text-[#888] mb-4">in corso — pensa liberamente</p>
            <button
              onClick={stop}
              className="px-6 py-2.5 text-sm text-[#888] border border-[#ddd] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200"
              aria-label="Interrompi timer"
            >
              Interrompi
            </button>
          </div>
        )}

        {timerState === 'done' && (
          <div>
            <p className="text-sm text-[#888] mb-2">tempo scaduto — chiudi</p>
            <p className="text-xs text-[#aaa]">
              Se il tema sembra importante, scrivilo sotto e rileggilo domani alle 18. Spesso non ti interessa più.
            </p>
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <label htmlFor="slot-note" className="block text-xs text-[#aaa] mb-2">
          Note libere
        </label>
        <textarea
          id="slot-note"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder=""
          className="w-full h-40 text-sm text-[#1a1a1a] bg-transparent resize-none border-none outline-none leading-relaxed placeholder:text-[#ddd]"
          aria-label="Area di scrittura libera"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-[#1a1a1a] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors duration-200"
        aria-label="Salva nota e torna alla home"
      >
        Salva nota
      </button>
    </div>
  );
}
