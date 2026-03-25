import type { DailyEntry, GroupEntry, DiagnosisResult } from '../types';

export function getDiagnosis(entry: DailyEntry | null): DiagnosisResult {
  if (!entry) {
    return {
      status: 'warn',
      tag: 'nessun dato',
      bordiLocked: true,
      readout: 'Nessun dato oggi. Completa il check-in per visualizzare la diagnosi.',
    };
  }
  const { stabilita, phi, loopEvents } = entry;
  if (stabilita >= 3.5 && phi >= 3 && loopEvents < 2) {
    return {
      status: 'stable',
      tag: 'sistema stabile',
      bordiLocked: false,
      readout: 'Substrato adeguato. Integrazione relazionale attiva. Probabilità di loop ridotta.',
    };
  }
  if (stabilita < 2 || loopEvents >= 3) {
    return {
      status: 'loop',
      tag: 'alta vulnerabilità',
      bordiLocked: true,
      readout: 'Sistema ad alta attivazione. Evita pensiero astratto. Esegui il protocollo base.',
    };
  }
  return {
    status: 'warn',
    tag: 'zona di transizione',
    bordiLocked: true,
    readout: 'Substrato parzialmente degradato. Limita input ad alta salienza.',
  };
}

export function getGroupDiagnosis(members: DailyEntry[]): GroupEntry {
  if (members.length === 0) {
    return {
      members: [],
      centroid: { phi: 0, stabilita: 0 },
      canDecide: true,
      isolatedMembers: [],
    };
  }
  const vulnerable = members.filter(m => m.stabilita < 2 || m.loopEvents >= 3);
  const centroid = {
    phi: members.reduce((s, m) => s + m.phi, 0) / members.length,
    stabilita: members.reduce((s, m) => s + m.stabilita, 0) / members.length,
  };
  return {
    members,
    centroid,
    canDecide: vulnerable.length < 3,
    isolatedMembers: members.filter(m => !m.phi_gruppo).map(m => m.nickname ?? ''),
  };
}

export function linearRegression(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((sum, x, i) => sum + (x - xMean) * (values[i] - yMean), 0);
  const den = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  return den === 0 ? 0 : num / den;
}
