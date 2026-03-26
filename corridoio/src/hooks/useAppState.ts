import { useState, useCallback, useEffect } from 'react';
import type { AppState, DailyEntry, GroupProjectState, ElaborazioneEntry, MomentoEvent } from '../types';
import { INITIAL_PROBLEMS } from '../data/problems';

const STORAGE_KEY = 'corridoio_state';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

const defaultGroupProject: GroupProjectState = {
  dove: '',
  statoRicerca: '',
  checklist: { sopralluogo: false, contratto: false, dataFissa: false },
  problems: INITIAL_PROBLEMS,
  prossimoIncontro: '',
  presenze: {},
};

const defaultState: AppState = {
  log: [],
  today: null,
  groupImports: [],
  mode: 'solo',
  nickname: '',
  groupName: '',
  settings: { slotDuration: 20, firstRun: true, darkMode: false },
  groupProject: defaultGroupProject,
  momentoLog: [],
  elaborazioneLog: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge to ensure new fields are present
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings ?? {}) },
      groupProject: {
        ...defaultGroupProject,
        ...(parsed.groupProject ?? {}),
        checklist: { ...defaultGroupProject.checklist, ...(parsed.groupProject?.checklist ?? {}) },
        problems: parsed.groupProject?.problems ?? defaultGroupProject.problems,
      },
      momentoLog: parsed.momentoLog ?? [],
      elaborazioneLog: parsed.elaborazioneLog ?? [],
    };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply dark mode class
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const setMode = useCallback((mode: 'solo' | 'gruppo', nickname = '', groupName = '') => {
    setState(s => ({
      ...s,
      mode,
      nickname,
      groupName,
      settings: { ...s.settings, firstRun: false },
    }));
  }, []);

  const saveCheckin = useCallback((entry: Omit<DailyEntry, 'date' | 'loopEvents' | 'stabilita'>) => {
    const stabilita = (entry.sonno + entry.corpo + (6 - entry.carico)) / 3;
    const todayStr = today();
    const full: DailyEntry = {
      ...entry,
      date: todayStr,
      stabilita,
      loopEvents: 0,
      nickname: entry.nickname,
    };
    setState(s => {
      const existingIdx = s.log.findIndex(e => e.date === todayStr);
      const newLog = existingIdx >= 0
        ? s.log.map((e, i) => i === existingIdx ? { ...full, loopEvents: e.loopEvents } : e)
        : [full, ...s.log];
      return { ...s, log: newLog, today: { ...full, loopEvents: existingIdx >= 0 ? s.log[existingIdx].loopEvents : 0 } };
    });
  }, []);

  const incrementLoop = useCallback(() => {
    const todayStr = today();
    setState(s => {
      const todayEntry = s.log.find(e => e.date === todayStr);
      if (!todayEntry) return s;
      const updated = { ...todayEntry, loopEvents: todayEntry.loopEvents + 1 };
      return {
        ...s,
        log: s.log.map(e => e.date === todayStr ? updated : e),
        today: s.today?.date === todayStr ? updated : s.today,
      };
    });
  }, []);

  const saveNote = useCallback((note: string) => {
    const todayStr = today();
    setState(s => {
      const todayEntry = s.log.find(e => e.date === todayStr);
      if (!todayEntry) return s;
      const updated = { ...todayEntry, note };
      return {
        ...s,
        log: s.log.map(e => e.date === todayStr ? updated : e),
        today: s.today?.date === todayStr ? updated : s.today,
      };
    });
  }, []);

  const importGroupData = useCallback((entries: DailyEntry[]) => {
    setState(s => ({
      ...s,
      groupImports: [...s.groupImports.filter(batch => {
        // Keep batches from different dates
        if (batch.length > 0 && entries.length > 0) {
          return batch[0].date !== entries[0].date;
        }
        return true;
      }), entries],
    }));
  }, []);

  const updateGroupProject = useCallback((updates: Partial<GroupProjectState>) => {
    setState(s => ({
      ...s,
      groupProject: { ...s.groupProject, ...updates },
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppState['settings']>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...updates } }));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(state.log, null, 2);
  }, [state.log]);

  const importData = useCallback((json: string) => {
    try {
      const entries = JSON.parse(json) as DailyEntry[];
      if (Array.isArray(entries)) {
        setState(s => ({ ...s, log: entries }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const saveMomento = useCallback((event: MomentoEvent) => {
    setState(s => ({ ...s, momentoLog: [...s.momentoLog, event] }));
  }, []);

  const saveElaborazione = useCallback((entry: ElaborazioneEntry) => {
    setState(s => ({ ...s, elaborazioneLog: [...s.elaborazioneLog, entry] }));
  }, []);

  const clearData = useCallback(() => {
    setState({ ...defaultState });
  }, []);

  // Sync today from log on mount
  const todayStr = today();
  const todayFromLog = state.log.find(e => e.date === todayStr) ?? null;
  const effectiveToday = state.today?.date === todayStr ? state.today : todayFromLog;

  return {
    state: { ...state, today: effectiveToday },
    setMode,
    saveCheckin,
    incrementLoop,
    saveNote,
    importGroupData,
    updateGroupProject,
    updateSettings,
    exportData,
    importData,
    clearData,
    saveMomento,
    saveElaborazione,
    todayStr,
  };
}
