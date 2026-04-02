import { useState, useEffect, useRef, useCallback } from 'react';
import type { useAppState } from '../hooks/useAppState';
import type { SilenzioEntry } from '../types';

type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

interface Props {
  appState: ReturnType<typeof useAppState>;
  navigate: (s: Screen) => void;
}

type Phase = 'choose' | 'sitting' | 'done';

const DURATIONS = [
  { label: '5 minuti',  seconds: 300 },
  { label: '10 minuti', seconds: 600 },
  { label: '20 minuti', seconds: 1200 },
  { label: 'libero',    seconds: 0 },
];

// Rotating prompts — not instructions, just pointing
const PROMPTS = [
  'Chi sta seduto?',
  'Da dove viene il prossimo pensiero?',
  'Cos\'è questo silenzio?',
  'Chi ascolta?',
  'Dov\'è il confine tra te e la stanza?',
  'Cosa rimane quando smetti di pensare di meditare?',
  'Questo momento — esiste davvero?',
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Silenzio({ appState, navigate }: Props) {
  const { logSilenzio } = appState;
  const [phase, setPhase] = useState<Phase>('choose');
  const [duration, setDuration] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [text, setText] = useState('');
  const [promptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const startRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const isLibero = duration === 0;

  const finish = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const entry: SilenzioEntry = {
      date: new Date().toISOString().slice(0, 10),
      duration: elapsed,
    };
    logSilenzio(entry);
    setPhase('done');
  }, [elapsed, logSilenzio]);

  useEffect(() => {
    if (phase !== 'sitting') return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(e);
      if (!isLibero && e >= duration) {
        finish();
      }
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, duration, isLibero, finish]);

  // Focus textarea when sitting starts
  useEffect(() => {
    if (phase === 'sitting') {
      setTimeout(() => textRef.current?.focus(), 300);
    }
  }, [phase]);

  const remaining = isLibero ? null : Math.max(0, duration - elapsed);
  const progress = isLibero ? 0 : elapsed / duration;

  if (phase === 'choose') {
    return (
      <div className="max-w-lg mx-auto px-5 pb-28 pt-6">
        <button
          onClick={() => navigate('home')}
          style={{ color: '#4a4640', fontSize: '0.8rem', letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: '32px' }}
        >
          ← il percorso
        </button>

        <div className="mb-8 fade-in">
          <p
            style={{
              color: '#c85428',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              lineHeight: '1.7',
              marginBottom: '6px',
            }}
          >
            {PROMPTS[promptIndex]}
          </p>
        </div>

        <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '12px' }}>
          DURATA
        </p>
        <div className="flex flex-col gap-2 mb-8">
          {DURATIONS.map(d => (
            <button
              key={d.seconds}
              onClick={() => setDuration(d.seconds)}
              className="py-3 px-4 rounded-xl text-left transition-all duration-150"
              style={{
                background: duration === d.seconds ? '#1e1a14' : '#131109',
                border: `1px solid ${duration === d.seconds ? '#c85428' : '#2a2620'}`,
                color: duration === d.seconds ? '#d8d0c0' : '#6a6050',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setElapsed(0);
            setPhase('sitting');
          }}
          className="w-full py-4 rounded-xl transition-all duration-200"
          style={{
            background: '#1a0e08',
            border: '1px solid #c85428',
            color: '#c85428',
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          siediti
        </button>
      </div>
    );
  }

  if (phase === 'sitting') {
    return (
      <div
        className="max-w-lg mx-auto px-5 pb-28 pt-12 flex flex-col"
        style={{ minHeight: '100dvh' }}
      >
        {/* Timer / progress */}
        <div className="flex justify-center mb-8">
          {isLibero ? (
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ border: '1px solid #2a2620' }}
            >
              <span style={{ color: '#4a4640', fontSize: '1.1rem', fontFamily: "'EB Garamond'" }}>
                {formatTime(elapsed)}
              </span>
            </div>
          ) : (
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 112 112" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="56" cy="56" r="50" fill="none" stroke="#1e1c18" strokeWidth="2" />
                <circle
                  cx="56" cy="56" r="50"
                  fill="none"
                  stroke="#c85428"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ color: '#4a4640', fontSize: '1rem', fontFamily: "'EB Garamond'" }}>
                  {remaining !== null ? formatTime(remaining) : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ephemeral writing space */}
        <div
          className="flex-1 p-4 rounded-xl mb-6"
          style={{ background: '#0c0b08', border: '1px solid #1a1810', minHeight: '160px' }}
        >
          <p style={{ color: '#2a2620', fontSize: '0.7rem', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {PROMPTS[promptIndex]}
          </p>
          <textarea
            ref={textRef}
            className="ephemeral"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="ciò che emerge..."
            rows={6}
          />
        </div>

        {/* Stop */}
        <button
          onClick={finish}
          className="w-full py-3 rounded-xl transition-all duration-200"
          style={{
            background: 'transparent',
            border: '1px solid #2a2620',
            color: '#4a4640',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          termina
        </button>
      </div>
    );
  }

  // Done
  return (
    <div className="max-w-lg mx-auto px-5 pb-28 pt-16 flex flex-col items-center">
      <div className="mb-8 fade-in text-center">
        {/* Enso — completion */}
        <svg width="72" height="72" viewBox="0 0 72 72" className="mb-6 mx-auto">
          <circle
            cx="36" cy="36" r="28"
            fill="none"
            stroke="#c85428"
            strokeWidth="2"
            strokeDasharray="152 22"
            strokeLinecap="round"
            transform="rotate(-15 36 36)"
          />
        </svg>
        <p style={{ color: '#6a6050', fontSize: '0.9rem', fontStyle: 'italic' }}>
          {formatTime(elapsed)} trascorsi
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => {
            setText('');
            setElapsed(0);
            setPhase('choose');
          }}
          className="w-full py-3 rounded-xl"
          style={{ background: '#131109', border: '1px solid #2a2620', color: '#8a7860', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          di nuovo
        </button>
        <button
          onClick={() => navigate('koan')}
          className="w-full py-3 rounded-xl"
          style={{ background: 'transparent', border: '1px solid #2a2620', color: '#4a4640', fontSize: '0.8rem', letterSpacing: '0.04em', cursor: 'pointer' }}
        >
          apri un koan
        </button>
        <button
          onClick={() => navigate('home')}
          className="w-full py-3 rounded-xl"
          style={{ background: 'transparent', border: 'none', color: '#3a3228', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          torna al percorso
        </button>
      </div>
    </div>
  );
}
