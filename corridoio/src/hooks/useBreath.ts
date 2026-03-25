import { useState, useEffect, useCallback, useRef } from 'react';

type BreathPhase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'done';

const CYCLE_DURATIONS: Record<Exclude<BreathPhase, 'idle' | 'done'>, number> = {
  'inhale': 4000,
  'hold-in': 1000,
  'exhale': 7000,
  'hold-out': 1000,
};

const PHASE_SEQUENCE: Array<Exclude<BreathPhase, 'idle' | 'done'>> = [
  'inhale', 'hold-in', 'exhale', 'hold-out',
];

const PHASE_LABELS: Record<BreathPhase, string> = {
  'idle': '',
  'inhale': 'Inspira',
  'hold-in': 'Tieni',
  'exhale': 'Espira',
  'hold-out': 'Pausa',
  'done': 'Completo',
};

const TOTAL_CYCLES = 6;

export function useBreath() {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycle, setCycle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [, setPhaseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const nextPhase = useCallback((currentPhaseIdx: number, currentCycle: number) => {
    const nextIdx = (currentPhaseIdx + 1) % PHASE_SEQUENCE.length;
    const nextCycle = nextIdx === 0 ? currentCycle + 1 : currentCycle;

    if (nextCycle >= TOTAL_CYCLES) {
      setPhase('done');
      setCycle(TOTAL_CYCLES);
      return;
    }

    const nextPhaseKey = PHASE_SEQUENCE[nextIdx];
    const duration = CYCLE_DURATIONS[nextPhaseKey];
    setPhase(nextPhaseKey);
    setPhaseIdx(nextIdx);
    setCycle(nextCycle);
    setTimeLeft(Math.ceil(duration / 1000));

    timerRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clear();
      nextPhase(nextIdx, nextCycle);
    }, duration);
  }, [clear]);

  const start = useCallback(() => {
    clear();
    const firstPhase = PHASE_SEQUENCE[0];
    const duration = CYCLE_DURATIONS[firstPhase];
    setPhase(firstPhase);
    setPhaseIdx(0);
    setCycle(0);
    setTimeLeft(Math.ceil(duration / 1000));

    timerRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clear();
      nextPhase(0, 0);
    }, duration);
  }, [clear, nextPhase]);

  const reset = useCallback(() => {
    clear();
    setPhase('idle');
    setCycle(0);
    setTimeLeft(0);
    setPhaseIdx(0);
  }, [clear]);

  useEffect(() => () => clear(), [clear]);

  const isExpanded = phase === 'hold-in' || phase === 'inhale';
  const label = PHASE_LABELS[phase];
  const progress = cycle / TOTAL_CYCLES;

  return { phase, cycle, timeLeft, start, reset, isExpanded, label, progress, totalCycles: TOTAL_CYCLES };
}
