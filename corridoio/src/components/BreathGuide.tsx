import { useBreath } from '../hooks/useBreath';

interface Props {
  onComplete?: () => void;
}

export default function BreathGuide({ onComplete }: Props) {
  const { phase, cycle, timeLeft, start, reset, isExpanded, label, totalCycles } = useBreath();

  const circleStyle: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #e8622a22, #e8622a44)',
    border: '2px solid #e8622a44',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
    transform: isExpanded ? 'scale(1.45)' : 'scale(1)',
  };

  const getAnimation = () => {
    switch (phase) {
      case 'inhale': return 'breathe-expand 4s ease forwards';
      case 'hold-in': return 'breathe-hold-big 1s linear forwards';
      case 'exhale': return 'breathe-contract 7s ease forwards';
      case 'hold-out': return 'breathe-hold-small 1s linear forwards';
      default: return 'none';
    }
  };

  if (phase === 'done') {
    onComplete?.();
    return (
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 rounded-full bg-[#e8f5ee] flex items-center justify-center mb-3">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-sm text-[#2d6a4f]">6 cicli completati</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 text-xs text-[#888] border border-[#ddd] rounded-lg"
        >
          Ripeti
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      {/* Animated circle */}
      <div className="relative mb-6" style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            ...circleStyle,
            animation: getAnimation(),
          }}
          aria-live="polite"
          aria-label={`Fase: ${label}, tempo: ${timeLeft} secondi`}
        >
          <div className="text-center">
            <div className="text-2xl font-light text-[#e8622a]">{timeLeft}</div>
            <div className="text-xs text-[#e8622a88] mt-1">{label}</div>
          </div>
        </div>
      </div>

      {/* Cycle counter */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < cycle ? 'bg-[#e8622a]' : 'bg-[#eee]'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-[#aaa] mb-4">
        Ciclo {cycle + 1} di {totalCycles} — 4 inspira / 1 pausa / 7 espira / 1 pausa
      </p>

      {phase === 'idle' ? (
        <button
          onClick={start}
          className="px-6 py-2.5 bg-[#e8622a] text-white rounded-lg text-sm font-medium hover:bg-[#d45520] transition-colors duration-200"
          aria-label="Avvia guida respirazione"
        >
          Avvia respirazione
        </button>
      ) : (
        <button
          onClick={reset}
          className="px-4 py-2 text-xs text-[#888] border border-[#ddd] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200"
          aria-label="Interrompi respirazione"
        >
          Interrompi
        </button>
      )}
    </div>
  );
}
