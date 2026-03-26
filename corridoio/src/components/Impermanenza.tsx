import { useState, useEffect, useRef } from 'react';
import type { NavProps } from '../App';
import type { ElaborazioneEntry } from '../types';

const DURATE = [
  ['pensiero singolo',        '~3 secondi'],
  ['ricordo episodico',       'anni → decenni'],
  ['essere umano',            '~80 anni'],
  ['specie Homo sapiens',     '~200.000 anni (finora)'],
  ['stella tipo Sole',        '~10 miliardi di anni'],
  ['protone',                 '>10³⁴ anni'],
  ['universo (morte termica)','~10¹⁰⁰ anni stimati'],
];

interface Props extends NavProps {
  onOpenCosmic: () => void;
}

export default function Impermanenza({ navigate, appState, onOpenCosmic }: Props) {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  // Tab 1: elaborazione
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [soggetto, setSoggetto] = useState('');
  const [differenza, setDifferenza] = useState('');
  const [possibilita, setPossibilita] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Tab 2: presenza
  const [presenzaChoice, setPresenzaChoice] = useState<string | null>(null);
  const [timerWhat, setTimerWhat] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecs, setTimerSecs] = useState(300);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elaborazioneLog: ElaborazioneEntry[] = appState.state.elaborazioneLog ?? [];

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function handleSave() {
    if (!soggetto.trim()) return;
    appState.saveElaborazione({
      date: new Date().toISOString().slice(0, 10),
      soggetto: soggetto.trim(),
      differenza: differenza.trim(),
      possibilita: possibilita.trim(),
    });
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setSoggetto(''); setDifferenza(''); setPossibilita(''); setStep(0);
    }, 1400);
  }

  function handleDiscard() {
    setSoggetto(''); setDifferenza(''); setPossibilita(''); setStep(0);
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(true); setTimerSecs(300); setTimerDone(false);
    timerRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          setTimerDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  const mm = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const ss = String(timerSecs % 60).padStart(2, '0');

  const mono = { fontFamily: "'JetBrains Mono','Courier New',monospace" };
  const serif = { fontFamily: "'EB Garamond',Georgia,serif" };

  return (
    <div className="max-w-lg mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 mb-1">
        <button onClick={() => navigate('home')}
          className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200"
          aria-label="Torna alla home">←</button>
        <div>
          <h1 className="text-base font-medium text-[#1a1a1a]" style={serif}>
            Impermanenza
          </h1>
          <p className="text-xs text-[#999]">finitezza come struttura, non come tragedia</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-7 bg-[#f0f0ee] rounded-lg p-0.5">
        {['Fisica', 'Elaborazione', 'Presenza'].map((t, i) => (
          <button key={t} onClick={() => setTab(i as 0|1|2)}
            className={`flex-1 py-2 text-xs rounded-md transition-all duration-200 ${
              tab === i ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ───── TAB 0: Fisica ───── */}
      {tab === 0 && (
        <div className="space-y-8">
          <h2 className="text-sm font-medium text-[#1a1a1a]">La struttura della finitezza</h2>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs border-collapse" style={mono}>
              <thead>
                <tr>
                  <th className="text-left py-2 pr-6 text-[#aaa] font-normal border-b border-[#e8e8e8]">oggetto</th>
                  <th className="text-left py-2 text-[#aaa] font-normal border-b border-[#e8e8e8]">durata</th>
                </tr>
              </thead>
              <tbody>
                {DURATE.map(([obj, dur]) => (
                  <tr key={obj} className="border-b border-[#f2f2f2]">
                    <td className="py-2 pr-6 text-[#333]">{obj}</td>
                    <td className="py-2 text-[#777]">{dur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-6 pt-2">
            <p className="leading-loose text-[#444]" style={{ ...serif, fontSize:'1.05rem', fontStyle:'italic' }}>
              "Ogni struttura dissipativa ha durata finita.
              Non come difetto del sistema — come condizione
              del suo funzionamento. Le stelle collassano
              e producono carbonio. Sei fatto di quel collasso."
            </p>

            <p className="text-sm leading-relaxed text-[#555]" style={serif}>
              "Una struttura che cessa non annulla la sua
              influenza causale sui sistemi che ha modificato.
              Il tuo sistema nervoso è stato alterato in modo
              fisicamente tracciabile da ogni relazione significativa.
              Quella modifica è permanente fino alla tua cessazione."
            </p>

            <p className="text-[0.65rem] text-[#bbb] leading-relaxed whitespace-pre-line" style={mono}>
              {"Questo non è consolazione.\nÈ la struttura causale del reale."}
            </p>
          </div>

          <button onClick={onOpenCosmic}
            className="w-full py-3 px-4 text-xs text-left text-[#666] border border-[#ddd] rounded-lg hover:bg-[#f7f7f7] transition-colors duration-200"
            style={mono}>
            → vedi la tua posizione nel corridoio
          </button>
        </div>
      )}

      {/* ───── TAB 1: Elaborazione ───── */}
      {tab === 1 && (
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-[#1a1a1a]">Influenza permanente</h2>

          {justSaved && (
            <div className="py-3 px-4 bg-[#f5f5f3] rounded-lg text-xs text-[#666]" style={mono}>
              salvato
            </div>
          )}

          {step === 0 && !justSaved && (
            <div className="space-y-5">
              <p className="text-sm text-[#333] leading-relaxed" style={serif}>
                Chi o cosa hai perso, o temi di perdere?
              </p>
              <input type="text" value={soggetto} onChange={e => setSoggetto(e.target.value)}
                className="w-full border-b border-[#ddd] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a]"
                placeholder="" />
              <button onClick={() => soggetto.trim() && setStep(1)}
                disabled={!soggetto.trim()}
                className="px-5 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg disabled:opacity-25 hover:bg-[#333] transition-colors duration-200">
                continua
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm text-[#333] leading-relaxed" style={serif}>
                Come sei diverso — concretamente — per averlo conosciuto?
                Non cosa ti manca. Come ha modificato il modo in cui percepisci, pensi, reagisci.
              </p>
              <textarea value={differenza} onChange={e => setDifferenza(e.target.value)} rows={4}
                className="w-full border border-[#e0e0e0] rounded-lg bg-transparent p-3 text-sm focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] resize-none" />
              <button onClick={() => differenza.trim() && setStep(2)}
                disabled={!differenza.trim()}
                className="px-5 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg disabled:opacity-25 hover:bg-[#333] transition-colors duration-200">
                continua
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-[#333] leading-relaxed" style={serif}>
                C'è qualcosa che quella relazione ha reso possibile in te che non esisteva prima?
              </p>
              <textarea value={possibilita} onChange={e => setPossibilita(e.target.value)} rows={4}
                className="w-full border border-[#e0e0e0] rounded-lg bg-transparent p-3 text-sm focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a] resize-none" />
              <button onClick={() => possibilita.trim() && setStep(3)}
                disabled={!possibilita.trim()}
                className="px-5 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg disabled:opacity-25 hover:bg-[#333] transition-colors duration-200">
                continua
              </button>
            </div>
          )}

          {step === 3 && !justSaved && (
            <div className="space-y-6">
              <p className="text-sm text-[#555] leading-relaxed" style={serif}>
                Quello che hai scritto descrive modifiche causali reali nel tuo sistema.
                Non sono ricordi — sono struttura. La perdita è reale.
                La modifica che ha prodotto, anche.
              </p>
              <div className="flex gap-3">
                <button onClick={handleSave}
                  className="px-5 py-2 text-xs bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors duration-200">
                  salva
                </button>
                <button onClick={handleDiscard}
                  className="px-5 py-2 text-xs text-[#888] border border-[#ddd] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200">
                  cancella senza salvare
                </button>
              </div>
            </div>
          )}

          {/* Archive */}
          {elaborazioneLog.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#eee]">
              <h3 className="text-xs text-[#aaa] mb-3" style={mono}>archivio</h3>
              <div className="space-y-1">
                {[...elaborazioneLog].reverse().map((e, i) => (
                  <details key={i} className="group">
                    <summary className="text-xs text-[#999] cursor-pointer py-1.5 hover:text-[#555] list-none flex items-center gap-1.5">
                      <span className="text-[#ccc] group-open:rotate-90 transition-transform inline-block">›</span>
                      <span style={mono}>{e.date}</span>
                      <span className="text-[#777]">— {e.soggetto}</span>
                    </summary>
                    <div className="pl-5 py-3 space-y-2 border-l border-[#f0f0f0]">
                      <p className="text-xs text-[#666] leading-relaxed" style={serif}>{e.differenza}</p>
                      {e.possibilita && (
                        <p className="text-xs text-[#999] leading-relaxed" style={serif}>{e.possibilita}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───── TAB 2: Presenza ───── */}
      {tab === 2 && (
        <div className="space-y-10">
          <h2 className="text-sm font-medium text-[#1a1a1a]">Solo questo</h2>

          {/* Block A */}
          <div className="space-y-4 py-2">
            <p className="leading-loose text-[#333]" style={{ ...serif, fontSize:'1.1rem' }}>
              Ogni momento è già completo.{'\n'}
              Non strumentale a un momento successivo.{'\n'}
              Quello che è accaduto, è accaduto —{'\n'}
              in modo non revocabile.{'\n'}
              Il passato non può essere tolto.
            </p>
            <p className="text-[0.6rem] text-[#bbb] leading-relaxed whitespace-pre-line" style={mono}>
              {"Gli eventi passati hanno statuto ontologico\npermanente nel blocco spazio-temporale."}
            </p>
          </div>

          {/* Block B */}
          <div className="space-y-5 py-2">
            <p className="text-base text-center text-[#333]" style={serif}>
              C'è qualcosa che stai trattando come mezzo invece che come già completo?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['una persona', 'un momento', 'me stesso'].map(opt => (
                <button key={opt} onClick={() => setPresenzaChoice(opt)}
                  className={`px-5 py-2 text-xs border rounded-lg transition-all duration-200 ${
                    presenzaChoice === opt
                      ? 'border-[#1a1a1a] text-[#1a1a1a]'
                      : 'border-[#ddd] text-[#999] hover:border-[#bbb] hover:text-[#666]'
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
            {presenzaChoice && (
              <p className="text-xs text-center text-[#aaa]" style={serif}>
                Nota la differenza. Non serve altro.
              </p>
            )}
          </div>

          {/* Block C — Dogen timer */}
          <div className="space-y-4 py-2">
            {!timerActive && !timerDone && (
              <div className="space-y-4">
                <input type="text" value={timerWhat} onChange={e => setTimerWhat(e.target.value)}
                  placeholder="cosa stai facendo adesso?"
                  className="w-full border-b border-[#ddd] bg-transparent py-2 text-sm focus:outline-none focus:border-[#1a1a1a] text-[#1a1a1a]" />
                <button onClick={startTimer}
                  className="px-6 py-3 text-xs border border-[#ccc] text-[#555] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200">
                  solo questo — 5 minuti
                </button>
              </div>
            )}

            {timerActive && (
              <div className="flex flex-col items-center py-8 space-y-7">
                {timerWhat && (
                  <p className="text-3xl text-center text-[#1a1a1a]" style={serif}>
                    {timerWhat}
                  </p>
                )}
                <p className="text-5xl font-light text-[#ccc]" style={mono}>
                  {mm}:{ss}
                </p>
                <button onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setTimerActive(false); setTimerSecs(300); setTimerWhat('');
                }} className="text-xs text-[#ddd] hover:text-[#888] transition-colors duration-200">
                  interrompi
                </button>
              </div>
            )}

            {timerDone && (
              <div className="py-4 text-center">
                <button onClick={() => { setTimerDone(false); setTimerSecs(300); setTimerWhat(''); }}
                  className="text-xs text-[#ccc] hover:text-[#888] transition-colors duration-200">
                  ↺
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
