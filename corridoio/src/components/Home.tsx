import { lazy, Suspense } from 'react';
import type { NavProps } from '../App';
import Corridor from './Corridor';
import { getDiagnosis, getGroupDiagnosis } from '../hooks/useDiagnosis';

const CosmicPosition = lazy(() => import('./CosmicPosition'));

interface Props extends NavProps {
  onOpenLoop: () => void;
}

const MODULE_CARDS = [
  { id: 'flowchart',     label: '? In difficoltà',   desc: 'tre domande per uscire dal loop',   screen: 'flowchart'     as const, accent: '#1a1a1a' },
  { id: 'entropia',      label: 'Entropia',          desc: 'sonno, corpo, carico',              screen: 'entropia'      as const, accent: '#e8622a' },
  { id: 'slot',          label: 'Slot',               desc: 'timer 20 min, pensiero libero',     screen: 'slot'          as const, accent: '#e8622a' },
  { id: 'phi',           label: 'φ_rel',              desc: 'integrazione relazionale',          screen: 'phi'           as const, accent: '#e8622a' },
  { id: 'bordi',         label: 'Bordi',              desc: 'posizioni ai margini del sapere',   screen: 'bordi'         as const, accent: '#e8622a' },
  { id: 'interesse',     label: 'Interesse Composto', desc: 'trend a 90 giorni',                 screen: 'interesse'     as const, accent: '#e8622a' },
  { id: 'impermanenza',  label: '◌ Impermanenza',     desc: 'finitezza come struttura',          screen: 'impermanenza'  as const, accent: '#555' },
  { id: 'cosmic-pos',    label: '· Posizione cosmica',desc: 'dove sei nel corridoio QM-GR',      screen: 'cosmic-position' as const, accent: '#3d5a80' },
];

function MetricBar({ label, value, prev }: { label: string; value: number; prev?: number }) {
  const pct = (value / 5) * 100;
  const trend = prev !== undefined ? (value > prev ? 'up' : value < prev ? 'down' : 'flat') : null;
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#888]">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-[#1a1a1a]">{value.toFixed(1)}</span>
          {trend === 'up' && <span className="text-xs text-[#2d6a4f]">↑</span>}
          {trend === 'down' && <span className="text-xs text-[#c84b2a]">↓</span>}
        </div>
      </div>
      <div className="h-1.5 bg-[#eee] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#e8622a] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

async function shareApp() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'CORRIDOIO', text: 'monitoraggio psicofisico personale', url });
    } catch { /* cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(url); alert('Link copiato'); } catch { /* ignore */ }
  }
}

export default function Home({ navigate, appState }: Props) {
  const { state } = appState;
  const { today, log, mode, groupImports, nickname, groupName, settings } = state;

  const yesterday = log[1] ?? null;
  const diagnosis = getDiagnosis(today);

  const todayDate = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Group decision indicator
  let groupDecision: { canDecide: boolean; stable: number; vulnerable: number } | null = null;
  if (mode === 'gruppo' && groupImports.length > 0) {
    const latestBatch = groupImports[groupImports.length - 1];
    const gd = getGroupDiagnosis(latestBatch);
    const vulnerable = latestBatch.filter(m => m.stabilita < 2 || m.loopEvents >= 3).length;
    groupDecision = { canDecide: gd.canDecide, stable: latestBatch.length - vulnerable, vulnerable };
  }

  const statusColors = {
    stable: 'bg-[#e8f5ee] text-[#2d6a4f]',
    warn: 'bg-[#fff3e0] text-[#c8860a]',
    loop: 'bg-[#fde8e8] text-[#7d2d3a]',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <button
            onClick={() => navigate('cosmic')}
            className="text-xl font-medium text-[#1a1a1a] hover:text-[#e8622a] transition-colors duration-200"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            aria-label="Apri diagramma cosmologico"
          >
            Corridoio
          </button>
          <p className="text-xs text-[#999] capitalize">{todayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'gruppo' && (
            <span className="text-xs text-[#666] bg-[#f0f4f8] px-2 py-1 rounded-full">
              {nickname || 'gruppo'}
            </span>
          )}
          <button
            onClick={shareApp}
            className="text-xs text-[#aaa] px-2.5 py-2 rounded-lg hover:bg-[#eee] transition-colors duration-200"
            aria-label="Condividi app"
            title="Condividi il link — ogni utente ha i propri dati"
          >
            ↑ condividi
          </button>
          <button
            onClick={() => navigate('checkin')}
            className="text-sm px-4 py-2 bg-[#e8622a] text-white rounded-lg font-medium hover:bg-[#d45520] transition-colors duration-200"
            aria-label="Apri check-in giornaliero"
          >
            {today ? '↺ check-in' : '+ check-in'}
          </button>
        </div>
      </div>

      {/* No data nudge */}
      {!today && (
        <div className="mb-4 px-4 py-3 bg-[#f7f6f2] border border-[#e8e8e0] rounded-xl">
          <p className="text-xs text-[#888]" style={{ fontFamily:"'EB Garamond',Georgia,serif" }}>
            Nessun check-in oggi. I moduli usano i dati di ieri come riferimento.
          </p>
        </div>
      )}

      {/* Group name */}
      {mode === 'gruppo' && groupName && (
        <p className="text-xs text-[#888] mb-3">{groupName}</p>
      )}

      {/* Group decision banner */}
      {groupDecision && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          groupDecision.canDecide
            ? 'bg-[#e8f5ee] text-[#2d6a4f]'
            : 'bg-[#fde8e8] text-[#7d2d3a]'
        }`}>
          {groupDecision.canDecide
            ? `Il gruppo può decidere oggi — ${groupDecision.stable} membri stabili`
            : `Attenzione: sistema collettivo instabile — rimanda decisioni importanti (${groupDecision.vulnerable} vulnerabili)`
          }
        </div>
      )}

      {/* Main layout: chart + sidebar */}
      <div className="flex gap-4 mb-6">
        {/* Corridor chart */}
        <div className="flex-1 bg-white rounded-lg p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Corridor
            today={today}
            history={log}
            groupImports={groupImports}
            mode={mode}
          />
        </div>

        {/* Sidebar */}
        <div className="w-40 flex flex-col gap-3">
          {/* Status badge */}
          <div className={`px-3 py-2 rounded-lg text-xs font-medium text-center ${statusColors[diagnosis.status]}`}>
            {diagnosis.tag}
          </div>

          {/* Readout */}
          <div
            className="text-xs text-[#666] leading-relaxed"
            style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '0.8rem' }}
          >
            {diagnosis.readout}
            {today && today.stabilita < 2.5 && (
              <button
                onClick={() => navigate('impermanenza')}
                className="block mt-1.5 text-[#888] hover:text-[#555] transition-colors duration-200"
                style={{ fontSize: '0.75rem' }}
              >
                → impermanenza disponibile
              </button>
            )}
          </div>

          {/* Metrics */}
          {today && (
            <div className="mt-1">
              <MetricBar label="Sonno" value={today.sonno} prev={yesterday?.sonno} />
              <MetricBar label="Corpo" value={today.corpo} prev={yesterday?.corpo} />
              <MetricBar label="Carico" value={6 - today.carico} prev={yesterday ? 6 - yesterday.carico : undefined} />
              <MetricBar label="φ_rel" value={today.phi} prev={yesterday?.phi} />
              <div className="mt-2 pt-2 border-t border-[#eee]">
                <MetricBar label="Stabilità" value={today.stabilita} prev={yesterday?.stabilita} />
              </div>
            </div>
          )}

          {!today && (
            <p className="text-xs text-[#aaa]">Nessun dato oggi</p>
          )}

          {/* CosmicPosition compact widget */}
          <div className="mt-2">
            <Suspense fallback={<div className="h-[130px] bg-[#0a0a14] rounded-lg" />}>
              <CosmicPosition compact onExpand={() => navigate('cosmic-position')} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Group import/export bar */}
      {mode === 'gruppo' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={async () => {
              if (!today) return;
              const { exportTodayJSON } = await import('../hooks/useGroup');
              const json = exportTodayJSON(today);
              try {
                await navigator.clipboard.writeText(json);
                alert('Dati copiati negli appunti');
              } catch {
                // fallback
                const ta = document.createElement('textarea');
                ta.value = json;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                alert('Dati copiati negli appunti');
              }
            }}
            disabled={!today}
            className="flex-1 py-2 text-xs bg-[#f0f4f8] text-[#3d5a80] rounded-lg hover:bg-[#e0e8f0] transition-colors duration-200 disabled:opacity-40"
            aria-label="Copia dati del giorno negli appunti"
          >
            Copia dati del giorno
          </button>
          <label className="flex-1 py-2 text-xs bg-[#f0f4f8] text-[#3d5a80] rounded-lg hover:bg-[#e0e8f0] transition-colors duration-200 text-center cursor-pointer" aria-label="Importa dati gruppo">
            Importa dati gruppo
            <input
              type="file"
              accept=".json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const { parseGroupJSON } = await import('../hooks/useGroup');
                const entries = parseGroupJSON(text);
                if (entries) {
                  appState.importGroupData(entries);
                  alert(`Importati ${entries.length} record`);
                } else {
                  alert('File non valido');
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-3">
        {MODULE_CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.screen)}
            className="p-4 bg-white rounded-xl text-left hover:shadow-md transition-all duration-200 group"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            aria-label={`Apri modulo ${card.label}`}
          >
            <div
              className="text-sm font-medium mb-1 transition-colors duration-200"
              style={{ color: card.accent }}
            >
              {card.label}
            </div>
            <div className="text-xs text-[#aaa] leading-tight">{card.desc}</div>
          </button>
        ))}

        {/* Progetto Gruppo card (only in group mode) */}
        {mode === 'gruppo' && (
          <button
            onClick={() => navigate('progetto')}
            className="p-4 bg-white rounded-xl text-left hover:shadow-md transition-all duration-200"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            aria-label="Apri modulo Progetto Gruppo"
          >
            <div className="text-sm font-medium text-[#3d5a80] mb-1">
              Progetto Gruppo
            </div>
            <div className="text-xs text-[#aaa] leading-tight">posto fisico, problemi, semaforo</div>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => appState.updateSettings({ darkMode: !settings.darkMode })}
          className="p-4 bg-white rounded-xl text-left hover:shadow-md transition-all duration-200"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          aria-label="Toggle dark mode"
        >
          <div className="text-sm font-medium text-[#aaa] mb-1">
            {settings.darkMode ? '◑ chiaro' : '◐ scuro'}
          </div>
          <div className="text-xs text-[#ccc] leading-tight">aspetto visivo</div>
        </button>
      </div>

      {/* Share info */}
      <p className="mt-6 text-xs text-[#ccc] text-center"
        style={{ fontFamily:"'JetBrains Mono','Courier New',monospace" }}>
        ogni utente tiene i propri dati sul suo dispositivo
      </p>
    </div>
  );
}
