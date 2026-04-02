export type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

export interface AppState {
  currentStage: number;          // 0-9, last stage visited
  visitedStages: number[];       // stages ever opened
  lastKoanIndex: number;         // last koan opened (by index in KOANS array)
  silenzioLog: SilenzioEntry[];  // ephemeral writing sessions
}

export interface SilenzioEntry {
  date: string;
  duration: number; // seconds actually spent
}

export interface Stadio {
  numero: number;       // 1-10
  titolo: string;
  titoloCinese: string;
  kanji: string;
  descrizione: string;  // 2-3 sentences, no explanation, only pointing
  poesia: string;       // Kakuan's verse (Italian)
  angolo: number;       // degrees in circle (0 = top)
  simbolo: string;      // brief symbol/glyph
}

export interface Koan {
  caso: number;         // Mumonkan case number
  titolo: string;
  testo: string;        // main koan text
  verso: string;        // Mumon's verse
  domanda?: string;     // single pointing question (optional)
  stadi: number[];      // associated stages (1-10)
}
