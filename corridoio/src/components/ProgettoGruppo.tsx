import { useState } from 'react';
import type { NavProps } from '../App';
import type { ProblemEntry } from '../types';
import { getGroupDiagnosis } from '../hooks/useDiagnosis';

type SortKey = 'votoPerOssessione' | 'voto' | 'ossessione';

const STATI: ProblemEntry['stato'][] = ['attivo', 'in valutazione', 'scartato', 'scelto'];

const STATO_COLORS: Record<ProblemEntry['stato'], string> = {
  'attivo': 'text-[#1a1a1a]',
  'in valutazione': 'text-[#c8860a]',
  'scartato': 'text-[#aaa] line-through',
  'scelto': 'text-[#2d6a4f] font-medium',
};

export default function ProgettoGruppo({ navigate, appState }: NavProps) {
  const { state, updateGroupProject } = appState;
  const { groupProject, groupImports } = state;
  const [sortKey, setSortKey] = useState<SortKey>('votoPerOssessione');

  // Semaforo
  let semaforoData: { stable: number; transition: number; vulnerable: number; total: number; canDecide: boolean } | null = null;
  if (groupImports.length > 0) {
    const latest = groupImports[groupImports.length - 1];
    const gd = getGroupDiagnosis(latest);
    const vulnerable = latest.filter(m => m.stabilita < 2 || m.loopEvents >= 3).length;
    const transition = latest.filter(m => {
      const d = m.stabilita;
      const l = m.loopEvents;
      return !(d < 2 || l >= 3) && !(d >= 3.5 && m.phi >= 3 && l < 2);
    }).length;
    semaforoData = {
      stable: latest.length - vulnerable - transition,
      transition,
      vulnerable,
      total: latest.length,
      canDecide: gd.canDecide,
    };
  }

  const sortedProblems = [...groupProject.problems].sort((a, b) => b[sortKey] - a[sortKey]);

  const daysToMeeting = groupProject.prossimoIncontro
    ? Math.ceil((new Date(groupProject.prossimoIncontro).getTime() - Date.now()) / 86400000)
    : null;

  const MEMBERS = ['Marco', 'Luca', 'Andrea', 'Paolo', 'Stefano', 'Matteo', 'Roberto'];

  function updateProblemStato(nome: string, stato: ProblemEntry['stato']) {
    updateGroupProject({
      problems: groupProject.problems.map(p => p.nome === nome ? { ...p, stato } : p),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 py-4 mb-2">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Progetto Gruppo</h1>
      </div>

      {/* Semaforo */}
      {semaforoData ? (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            semaforoData.canDecide
              ? 'bg-[#e8f5ee] text-[#2d6a4f]'
              : 'bg-[#fde8e8] text-[#7d2d3a]'
          }`}
        >
          <div className="font-medium mb-1">
            {semaforoData.canDecide
              ? `Buon momento per decidere — ${semaforoData.stable}/${semaforoData.total} stabili`
              : `Rimanda decisioni importanti — ${semaforoData.vulnerable} vulnerabili su ${semaforoData.total}`
            }
          </div>
          <div className="text-xs opacity-75">
            {semaforoData.stable} stabili · {semaforoData.transition} transizione · {semaforoData.vulnerable} vulnerabili
          </div>
        </div>
      ) : (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[#f5f5f5] text-sm text-[#888]">
          Importa i dati del gruppo per il semaforo decisionale
        </div>
      )}

      {/* Posto Fisico */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Posto Fisico</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="dove" className="block text-xs text-[#aaa] mb-1">Dove state cercando?</label>
            <input
              id="dove"
              type="text"
              value={groupProject.dove}
              onChange={e => updateGroupProject({ dove: e.target.value })}
              placeholder="es. Oltrepò Pavese, Bassa Lodigiana..."
              className="w-full px-3 py-2 rounded-lg border border-[#eee] text-sm text-[#1a1a1a] bg-[#fafafa] outline-none focus:border-[#3d5a80]"
            />
          </div>
          <div>
            <label htmlFor="stato-ricerca" className="block text-xs text-[#aaa] mb-1">Stato della ricerca</label>
            <input
              id="stato-ricerca"
              type="text"
              value={groupProject.statoRicerca}
              onChange={e => updateGroupProject({ statoRicerca: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#eee] text-sm text-[#1a1a1a] bg-[#fafafa] outline-none focus:border-[#3d5a80]"
            />
          </div>
          <div className="space-y-2 pt-1">
            {([
              ['sopralluogo', 'Sopralluogo fatto'],
              ['contratto', 'Contratto firmato'],
              ['dataFissa', 'Data fissa mensile stabilita'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupProject.checklist[key]}
                  onChange={e => updateGroupProject({
                    checklist: { ...groupProject.checklist, [key]: e.target.checked }
                  })}
                  className="w-4 h-4 rounded accent-[#3d5a80]"
                />
                <span className="text-sm text-[#1a1a1a]">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Problemi */}
      <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">Problemi</h2>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="text-xs text-[#888] bg-transparent border border-[#eee] rounded px-2 py-1"
            aria-label="Ordina per"
          >
            <option value="votoPerOssessione">voto×ossessione</option>
            <option value="voto">voto</option>
            <option value="ossessione">ossessione</option>
          </select>
        </div>

        <div className="space-y-2">
          {sortedProblems.map((p, i) => (
            <div
              key={p.nome}
              className={`flex items-start gap-3 py-2 px-2 rounded-lg ${p.stato === 'scelto' ? 'bg-[#e8f5ee]' : ''}`}
            >
              <span className="text-xs text-[#ccc] w-5 flex-shrink-0 pt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${STATO_COLORS[p.stato]}`}>{p.nome}</p>
                <p className="text-xs text-[#aaa] mt-0.5">{p.votoPerOssessione} · {p.voto}×{p.ossessione}</p>
              </div>
              <select
                value={p.stato}
                onChange={e => updateProblemStato(p.nome, e.target.value as ProblemEntry['stato'])}
                className="text-xs bg-transparent border border-[#eee] rounded px-1 py-0.5 flex-shrink-0"
                aria-label={`Stato: ${p.nome}`}
              >
                {STATI.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Appuntamento */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Prossimo Incontro</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="date"
            value={groupProject.prossimoIncontro}
            onChange={e => updateGroupProject({ prossimoIncontro: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg border border-[#eee] text-sm text-[#1a1a1a] bg-[#fafafa] outline-none focus:border-[#3d5a80]"
            aria-label="Data prossimo incontro"
          />
          {daysToMeeting !== null && (
            <span className={`text-sm font-medium ${daysToMeeting <= 7 ? 'text-[#e8622a]' : 'text-[#888]'}`}>
              {daysToMeeting > 0 ? `${daysToMeeting}g` : daysToMeeting === 0 ? 'oggi' : 'passato'}
            </span>
          )}
        </div>

        <h3 className="text-xs text-[#aaa] mb-2">Presenze</h3>
        <div className="space-y-1">
          {MEMBERS.map(m => (
            <div key={m} className="flex items-center gap-2">
              <span className="text-xs text-[#666] w-20">{m}</span>
              <div className="flex gap-1">
                {(['si', 'forse', 'no'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateGroupProject({
                      presenze: { ...groupProject.presenze, [m]: opt }
                    })}
                    className={`px-2.5 py-1 rounded text-xs transition-all duration-200 ${
                      groupProject.presenze[m] === opt
                        ? opt === 'si' ? 'bg-[#2d6a4f] text-white'
                          : opt === 'forse' ? 'bg-[#c8860a] text-white'
                          : 'bg-[#7d2d3a] text-white'
                        : 'bg-[#f5f5f5] text-[#888] hover:bg-[#eee]'
                    }`}
                    aria-pressed={groupProject.presenze[m] === opt}
                    aria-label={`${m} - ${opt}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
