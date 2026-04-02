export interface DailyEntry {
  date: string;
  nickname?: string;
  sonno: number;       // 1-5
  corpo: number;       // 1-5
  carico: number;      // 1-5 (inversamente proporzionale alla stabilità)
  phi: number;         // 1-5 (integrazione relazionale)
  phi_gruppo: boolean; // solo modalità gruppo
  stabilita: number;   // calcolata: (sonno + corpo + (6-carico)) / 3
  loopEvents: number;
  note?: string;
}

export interface GroupEntry {
  members: DailyEntry[];
  centroid: { phi: number; stabilita: number };
  canDecide: boolean;
  isolatedMembers: string[];
}

export interface ProblemEntry {
  nome: string;
  voto: number;
  ossessione: number;
  votoPerOssessione: number;
  stato: 'attivo' | 'in valutazione' | 'scartato' | 'scelto';
}

export interface GroupProjectState {
  dove: string;
  statoRicerca: string;
  checklist: {
    sopralluogo: boolean;
    contratto: boolean;
    dataFissa: boolean;
  };
  problems: ProblemEntry[];
  prossimoIncontro: string;
  presenze: Record<string, 'si' | 'forse' | 'no'>;
}

export interface AppSettings {
  slotDuration: number;  // minutes, default 20
  firstRun: boolean;
  darkMode: boolean;
}

export interface ElaborazioneEntry {
  date: string;
  soggetto: string;
  differenza: string;
  possibilita: string;
}

export interface MomentoEvent {
  date: string;
  time: string;
  reason: 'ansia' | 'noia' | 'abitudine';
}

export interface AppState {
  log: DailyEntry[];
  today: DailyEntry | null;
  groupImports: DailyEntry[][];  // array of imported member entries per day
  mode: 'solo' | 'gruppo';
  nickname: string;
  groupName: string;
  settings: AppSettings;
  groupProject: GroupProjectState;
  momentoLog: MomentoEvent[];
  elaborazioneLog: ElaborazioneEntry[];
}

export type Screen =
  | 'onboarding'
  | 'mode-select'
  | 'home'
  | 'checkin'
  | 'loop'
  | 'slot'
  | 'entropia'
  | 'phi'
  | 'bordi'
  | 'interesse'
  | 'progetto'
  | 'history'
  | 'cosmic'
  | 'impermanenza'
  | 'cosmic-position'
  | 'flowchart';

export interface DiagnosisResult {
  status: 'stable' | 'warn' | 'loop';
  tag: string;
  bordiLocked: boolean;
  readout: string;
}
