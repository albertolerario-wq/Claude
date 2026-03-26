import { useState, useEffect, useRef } from 'react';
import BreathGuide from './BreathGuide';

type MomentoReason = 'ansia' | 'noia' | 'abitudine';

interface Props {
  onDismiss: (reason: MomentoReason | null) => void;
  onSave: (reason: MomentoReason) => void;
}

const NOIA_ITEMS = [
  { id: 'dogen', label: "dogen 5 min — scegli un'azione e falla completamente", secs: 300 },
  { id: 'walk',  label: 'cammina senza destinazione — 5 minuti', secs: 300 },
  { id: 'write', label: 'scrivi una cosa concreta da fare adesso', secs: 0 },
  { id: 'wait',  label: 'aspetta 90 secondi prima di fare qualsiasi cosa', secs: 90 },
];

type Step = 'question' | 'ansia' | 'ansia-done' | 'noia' | 'noia-active' | 'abitudine';

export default function Momento({ onDismiss, onSave }: Props) {
  const [step, setStep] = useState<Step>('question');
  const [noiaItem, setNoiaItem] = useState<typeof NOIA_ITEMS[0] | null>(null);
  const [writeText, setWriteText] = useState('');
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [abCountdown, setAbCountdown] = useState(8);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Abitudine auto-dismiss
  useEffect(() => {
    if (step !== 'abitudine') return;
    const id = setInterval(() => {
      setAbCountdown(c => {
        if (c <= 1) { clearInterval(id); onDismiss('abitudine'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, onDismiss]);

  // Noia timer
  useEffect(() => {
    if (!timerRunning) return;
    intervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { clearInterval(intervalRef.current!); setTimerRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  function choose(reason: MomentoReason) {
    onSave(reason);
    setStep(reason === 'ansia' ? 'ansia' : reason === 'noia' ? 'noia' : 'abitudine');
  }

  function selectNoia(item: typeof NOIA_ITEMS[0]) {
    setNoiaItem(item);
    if (item.secs > 0) { setTimerSecs(item.secs); setTimerRunning(true); }
    setStep('noia-active');
  }

  const m = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const s = String(timerSecs % 60).padStart(2, '0');
  const mono = { fontFamily: "'JetBrains Mono','Courier New',monospace" };
  const serif = { fontFamily: "'EB Garamond',Georgia,serif" };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0c10] flex flex-col items-center justify-center px-6"
      role="dialog" aria-modal="true">

      {step === 'question' && (
        <div className="w-full max-w-sm space-y-10">
          <p className="text-lg text-center text-[#b0b0c0] leading-relaxed" style={serif}>
            perché hai aperto il telefono adesso?
          </p>
          <div className="flex flex-col gap-3">
            {(['ansia', 'noia', 'abitudine'] as MomentoReason[]).map(r => (
              <button key={r} onClick={() => choose(r)}
                className="py-3.5 text-sm border border-[#252530] text-[#7070a0] rounded-lg hover:border-[#404060] hover:text-[#9090c0] transition-all duration-200">
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => onDismiss(null)}
            className="w-full text-xs text-[#333] hover:text-[#555] transition-colors py-2">
            continua
          </button>
        </div>
      )}

      {step === 'ansia' && (
        <div className="w-full max-w-sm">
          <BreathGuide onComplete={() => setStep('ansia-done')} />
        </div>
      )}

      {step === 'ansia-done' && (
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button onClick={() => onDismiss('ansia')}
            className="py-3.5 text-sm border border-[#252530] text-[#7070a0] rounded-lg hover:border-[#404060] hover:text-[#9090c0] transition-all duration-200">
            continua con l'app
          </button>
          <button onClick={() => onDismiss('ansia')}
            className="py-3 text-sm text-[#444] hover:text-[#666] transition-colors duration-200">
            metti giù il telefono
          </button>
        </div>
      )}

      {step === 'noia' && (
        <div className="w-full max-w-sm space-y-5">
          <p className="text-sm text-center text-[#555]" style={serif}>
            scegli un micro-intervento
          </p>
          <div className="flex flex-col gap-2">
            {NOIA_ITEMS.map(item => (
              <button key={item.id} onClick={() => selectNoia(item)}
                className="py-3 px-4 text-xs text-left border border-[#252530] text-[#7070a0] rounded-lg hover:border-[#404060] hover:text-[#9090c0] transition-all duration-200 leading-relaxed">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'noia-active' && noiaItem && (
        <div className="w-full max-w-sm flex flex-col items-center space-y-7 text-center">
          <p className="text-sm text-[#7070a0]" style={serif}>{noiaItem.label}</p>

          {noiaItem.secs > 0 && timerRunning && (
            <p className="text-5xl font-light text-[#404060]" style={mono}>{m}:{s}</p>
          )}
          {noiaItem.secs > 0 && !timerRunning && timerSecs === 0 && (
            <p className="text-xs text-[#444]" style={mono}>completato</p>
          )}
          {noiaItem.id === 'write' && (
            <textarea value={writeText} onChange={e => setWriteText(e.target.value)}
              placeholder="una cosa concreta"
              rows={3}
              className="w-full bg-transparent border border-[#252530] text-[#9090a0] rounded-lg p-3 text-sm focus:outline-none focus:border-[#404060] resize-none" />
          )}
          <button onClick={() => onDismiss('noia')}
            className="py-3 px-8 text-sm border border-[#252530] text-[#7070a0] rounded-lg hover:border-[#404060] hover:text-[#9090c0] transition-all duration-200">
            torna all'app
          </button>
        </div>
      )}

      {step === 'abitudine' && (
        <div className="w-full max-w-sm space-y-8 text-center">
          <p className="text-base text-[#6060a0] leading-loose" style={{ ...serif, lineHeight:'2' }}>
            Il sistema ha aperto il telefono prima che tu lo decidessi.
            Non serve giudicare —
            serve notare la differenza tra i due.
          </p>
          <p className="text-xs text-[#2a2a3e]" style={mono}>{abCountdown}</p>
        </div>
      )}
    </div>
  );
}
