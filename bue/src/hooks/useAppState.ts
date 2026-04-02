import { useCallback, useReducer } from 'react';
import type { AppState, SilenzioEntry } from '../types';

const STORAGE_KEY = 'bue_state_v1';

function defaultState(): AppState {
  return {
    currentStage: 0,
    visitedStages: [],
    lastKoanIndex: 0,
    silenzioLog: [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState(),
      ...parsed,
    };
  } catch {
    return defaultState();
  }
}

function saveState(s: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded */ }
}

type Action =
  | { type: 'SET_STAGE'; stage: number }
  | { type: 'SET_KOAN'; index: number }
  | { type: 'LOG_SILENZIO'; entry: SilenzioEntry };

function reducer(state: AppState, action: Action): AppState {
  let next: AppState;
  switch (action.type) {
    case 'SET_STAGE':
      next = {
        ...state,
        currentStage: action.stage,
        visitedStages: state.visitedStages.includes(action.stage)
          ? state.visitedStages
          : [...state.visitedStages, action.stage],
      };
      break;
    case 'SET_KOAN':
      next = { ...state, lastKoanIndex: action.index };
      break;
    case 'LOG_SILENZIO':
      next = { ...state, silenzioLog: [...state.silenzioLog, action.entry] };
      break;
    default:
      return state;
  }
  saveState(next);
  return next;
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  const setStage = useCallback((stage: number) => {
    dispatch({ type: 'SET_STAGE', stage });
  }, []);

  const setKoan = useCallback((index: number) => {
    dispatch({ type: 'SET_KOAN', index });
  }, []);

  const logSilenzio = useCallback((entry: SilenzioEntry) => {
    dispatch({ type: 'LOG_SILENZIO', entry });
  }, []);

  return { state, setStage, setKoan, logSilenzio };
}
