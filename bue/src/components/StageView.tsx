import type { useAppState } from '../hooks/useAppState';
import { STADI } from '../data/stadi';
import { KOANS } from '../data/koans';

type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

interface Props {
  appState: ReturnType<typeof useAppState>;
  navigate: (s: Screen) => void;
}

export default function StageView({ appState, navigate }: Props) {
  const { state, setStage, setKoan } = appState;
  const stadio = STADI[state.currentStage];

  // Koans linked to this stage
  const linkedKoans = KOANS.filter(k => k.stadi.includes(stadio.numero));

  const prev = (state.currentStage - 1 + 10) % 10;
  const next = (state.currentStage + 1) % 10;

  return (
    <div className="max-w-lg mx-auto px-5 pb-28 pt-6">

      {/* Back */}
      <button
        onClick={() => navigate('home')}
        style={{ color: '#4a4640', fontSize: '0.8rem', letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: '24px' }}
      >
        ← il percorso
      </button>

      {/* Stage header */}
      <div className="mb-6 fade-in">
        <div className="flex items-baseline gap-4 mb-1">
          <span style={{ fontSize: '2.8rem', color: '#3a3028', lineHeight: 1, fontFamily: "'EB Garamond', Georgia, serif" }}>
            {stadio.kanji}
          </span>
          <span style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            {stadio.numero} / 10
          </span>
        </div>
        <h2
          style={{ color: '#d8d0c0', fontSize: '1.5rem', fontWeight: 400, marginBottom: '2px', fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          {stadio.titolo}
        </h2>
        <p style={{ color: '#4a4640', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
          {stadio.titoloCinese}
        </p>
      </div>

      {/* Description */}
      <div
        className="mb-6 p-5 rounded-xl"
        style={{ background: '#131109', border: '1px solid #2a2620' }}
      >
        <p style={{ color: '#a09080', fontSize: '1rem', lineHeight: '1.75', fontStyle: 'italic' }}>
          {stadio.descrizione}
        </p>
      </div>

      {/* Kakuan's verse */}
      <div className="mb-6">
        <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '10px' }}>
          KAKUAN — XII SECOLO
        </p>
        <div
          className="p-5 rounded-xl"
          style={{ background: '#0f0d0a', border: '1px solid #1e1c18' }}
        >
          {stadio.poesia.split('\n').map((line, i) => (
            <p
              key={i}
              style={{
                color: '#6a6050',
                fontSize: '0.9rem',
                lineHeight: '1.85',
                fontStyle: 'italic',
                marginBottom: i < stadio.poesia.split('\n').length - 1 ? '2px' : 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Linked koans */}
      {linkedKoans.length > 0 && (
        <div className="mb-6">
          <p style={{ color: '#3a3228', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '10px' }}>
            KOAN ASSOCIATI
          </p>
          <div className="flex flex-col gap-2">
            {linkedKoans.map(koan => {
              const koanIndex = KOANS.findIndex(k => k.caso === koan.caso);
              return (
                <button
                  key={koan.caso}
                  onClick={() => {
                    setKoan(koanIndex);
                    navigate('koan');
                  }}
                  className="text-left p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: '#131109',
                    border: '1px solid #2a2620',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#4a4640', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                    caso {koan.caso}
                  </span>
                  <p style={{ color: '#8a7860', fontSize: '0.9rem', marginTop: '2px' }}>
                    {koan.titolo}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigate stages */}
      <div className="flex gap-3">
        <button
          onClick={() => setStage(prev)}
          className="flex-1 py-3 rounded-xl transition-all duration-200"
          style={{ background: '#131109', border: '1px solid #2a2620', color: '#4a4640', fontSize: '0.8rem' }}
        >
          ← {STADI[prev].kanji}
        </button>
        <button
          onClick={() => setStage(next)}
          className="flex-1 py-3 rounded-xl transition-all duration-200"
          style={{ background: '#131109', border: '1px solid #2a2620', color: '#4a4640', fontSize: '0.8rem' }}
        >
          {STADI[next].kanji} →
        </button>
      </div>

    </div>
  );
}
