import { useState } from 'react';
import type { useAppState } from '../hooks/useAppState';
import { KOANS } from '../data/koans';

type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

interface Props {
  appState: ReturnType<typeof useAppState>;
  navigate: (s: Screen) => void;
}

export default function KoanView({ appState, navigate }: Props) {
  const { state, setKoan } = appState;
  const [showVerso, setShowVerso] = useState(false);
  const [showDomanda, setShowDomanda] = useState(false);

  const koan = KOANS[state.lastKoanIndex];

  function openKoan(index: number) {
    setKoan(index);
    setShowVerso(false);
    setShowDomanda(false);
    window.scrollTo(0, 0);
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-28 pt-6">

      {/* Back */}
      <button
        onClick={() => navigate('home')}
        style={{ color: '#4a4640', fontSize: '0.8rem', letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: '24px' }}
      >
        ← il percorso
      </button>

      {/* Header */}
      <div className="mb-6">
        <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '4px' }}>
          MUMONKAN — CASO {koan.caso}
        </p>
        <h2
          style={{ color: '#d8d0c0', fontSize: '1.4rem', fontWeight: 400, fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          {koan.titolo}
        </h2>
      </div>

      {/* Koan text */}
      <div
        className="mb-5 p-5 rounded-xl fade-in"
        style={{ background: '#131109', border: '1px solid #2a2620' }}
      >
        {koan.testo.split('\n').map((line, i) => (
          line.trim() === '' ? (
            <div key={i} style={{ height: '0.8em' }} />
          ) : (
            <p
              key={i}
              style={{
                color: '#c8bea8',
                fontSize: '1rem',
                lineHeight: '1.8',
                fontStyle: line.startsWith('«') || line.startsWith('"') ? 'normal' : 'normal',
              }}
            >
              {line}
            </p>
          )
        ))}
      </div>

      {/* Mumon's verse — revealed on tap */}
      {!showVerso ? (
        <button
          onClick={() => setShowVerso(true)}
          className="w-full py-3 mb-4 rounded-xl transition-all duration-200"
          style={{
            background: 'transparent',
            border: '1px solid #2a2620',
            color: '#4a4640',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          il verso di Mumon
        </button>
      ) : (
        <div
          className="mb-4 p-5 rounded-xl fade-in"
          style={{ background: '#0f0d0a', border: '1px solid #1e1c18' }}
        >
          <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '10px' }}>
            MUMON EKAI — 無門慧開
          </p>
          {koan.verso.split('\n').map((line, i) => (
            <p
              key={i}
              style={{ color: '#6a6050', fontSize: '0.9rem', lineHeight: '1.9', fontStyle: 'italic' }}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Pointing question — revealed on tap */}
      {koan.domanda && (
        !showDomanda ? (
          <button
            onClick={() => setShowDomanda(true)}
            className="w-full py-3 mb-6 rounded-xl transition-all duration-200"
            style={{
              background: 'transparent',
              border: '1px solid #c85428',
              color: '#7a3018',
              fontSize: '0.8rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            una domanda
          </button>
        ) : (
          <div
            className="mb-6 p-5 rounded-xl fade-in"
            style={{ background: '#160c08', border: '1px solid #3a1810' }}
          >
            <p
              style={{
                color: '#c85428',
                fontSize: '1.05rem',
                lineHeight: '1.7',
                fontStyle: 'italic',
              }}
            >
              {koan.domanda}
            </p>
          </div>
        )
      )}

      {/* Silence prompt */}
      <button
        onClick={() => navigate('silenzio')}
        className="w-full py-3 mb-8 rounded-xl transition-all duration-200"
        style={{
          background: '#131109',
          border: '1px solid #2a2620',
          color: '#6a6050',
          fontSize: '0.8rem',
          letterSpacing: '0.06em',
          cursor: 'pointer',
        }}
      >
        siediti con questo
      </button>

      {/* Koan list */}
      <div>
        <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '10px' }}>
          TUTTI I CASI
        </p>
        <div className="flex flex-col gap-1.5">
          {KOANS.map((k, i) => (
            <button
              key={k.caso}
              onClick={() => openKoan(i)}
              className="text-left px-4 py-3 rounded-lg transition-all duration-150"
              style={{
                background: i === state.lastKoanIndex ? '#1e1a14' : 'transparent',
                border: `1px solid ${i === state.lastKoanIndex ? '#3a3028' : '#1a1810'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ color: '#3a3228', fontSize: '0.7rem', marginRight: '10px', letterSpacing: '0.04em' }}>
                {k.caso}
              </span>
              <span style={{ color: i === state.lastKoanIndex ? '#a09080' : '#5a5040', fontSize: '0.88rem' }}>
                {k.titolo}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
