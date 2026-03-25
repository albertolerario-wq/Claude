import { useCallback } from 'react';
import type { DailyEntry } from '../types';

export function exportTodayJSON(entry: DailyEntry): string {
  const minimal = {
    v: 1,
    nickname: entry.nickname ?? '',
    date: entry.date,
    sonno: entry.sonno,
    corpo: entry.corpo,
    carico: entry.carico,
    phi: entry.phi,
    phi_gruppo: entry.phi_gruppo,
    stabilita: entry.stabilita,
    loopEvents: entry.loopEvents,
  };
  return JSON.stringify(minimal, null, 2);
}

export function parseGroupJSON(raw: string): DailyEntry[] | null {
  try {
    const parsed = JSON.parse(raw);
    // Accept array of entries or single entry
    const entries: DailyEntry[] = Array.isArray(parsed)
      ? parsed
      : [parsed];

    // Validate minimum structure
    for (const e of entries) {
      if (!e.date || typeof e.sonno !== 'number') return null;
      // Ensure stabilita is present
      if (typeof e.stabilita !== 'number') {
        e.stabilita = (e.sonno + e.corpo + (6 - e.carico)) / 3;
      }
      if (typeof e.loopEvents !== 'number') e.loopEvents = 0;
      if (typeof e.phi_gruppo !== 'boolean') e.phi_gruppo = false;
    }
    return entries;
  } catch {
    return null;
  }
}

export function useGroupExport(entry: DailyEntry | null) {
  const copyToClipboard = useCallback(async () => {
    if (!entry) return false;
    const json = exportTodayJSON(entry);
    try {
      await navigator.clipboard.writeText(json);
      return true;
    } catch {
      return false;
    }
  }, [entry]);

  return { copyToClipboard };
}
