import type { NavProps } from '../App';
import Corridor from './Corridor';
import { getDiagnosis, getGroupDiagnosis } from '../hooks/useDiagnosis';

interface Props extends NavProps {
  onOpenLoop: () => void;
}

// Moduli — nomi leggibili da chiunque
const MODULE_CARDS = [
  {
    id: 'flowchart',
    label: 'In difficoltà',
    desc: 'Quando qualcosa non va — 3 domande guidate',
    screen: 'flowchart' as const,
    accent: '#1a1a1a',
    icon: '?',
  },
  {
    id: 'entropia',
    label: 'Come stai',
    desc: 'Registra sonno, tensione corporea e livello di stress',
    screen: 'entropia' as const,
    accent: '#e8622a',
    icon: '◈',
  },
  {
    id: 'slot',
    label: 'Spazio libero',
    desc: 'Timer 20 minuti — pensiero senza agenda',
    screen: 'slot' as const,
    accent: '#e8622a',
    icon: '◷',
  },
  {
    id: 'phi',
    label: 'Relazioni',
    desc: 'Come stai con le persone che contano',
    screen: 'phi' as const,
    accent: '#e8622a',
    icon: 'φ',
  },
  {
    id: 'bordi',
    label: 'Bordi',
    desc: 'Letture brevi ai limiti di scienza e filosofia',
    screen: 'bordi' as const,
    accent: '#c8860a',
    icon: '∂',
  },
  {
    id: 'interesse',
    label: 'Andamento',
    desc: 'Come cambi nel tempo — grafico 90 giorni',
    screen: 'interesse' as const,
    accent: '#2d6a4f',
    icon: '~',
  },
  {
    id: 'impermanenza',
    label: 'Impermanenza',
    desc: 'Sulla perdita, la finitezza, il presente',
    screen: 'impermanenza' as const,
    accent: '#666',
    icon: '◌',
  },
  {
    id: 'cosmic-pos',
    label: 'Dove sei',
    desc: 'La tua posizione fisica nell\'universo',
    screen: 'cosmic-position' as const,
    accent: '#3d5a80',
    icon: '·',
  },
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
    <div className="max-w-lg mx-auto px-4 pb-32">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between pt-5 pb-3">
        <div>
          <button
            onClick={() => navigate('cosmic')}
            className="text-2xl font-medium text-[#1a1a1a] hover:text-[#e8622a] transition-colors duration-200 leading-none"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            aria-label="Apri diagramma cosmologico"
          >
            Corridoio
          </button>
          <p className="text-xs text-[#bbb] mt-0.5 capitalize">{todayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'gruppo' && (
            <span className="text-xs text-[#666] bg-[#f0f4f8] px-2 py-1 rounded-full">
              {nickname || 'gruppo'}
            </span>
          )}
          <button
            onClick={shareApp}
            className="text-xs text-[#bbb] px-2.5 py-2 rounded-lg hover:bg-[#eee] transition-colors duration-200"
            aria-label="Condividi app"
          >
            condividi
          </button>
          <button
            onClick={() => navigate('checkin')}
            className="text-sm px-4 py-2.5 bg-[#e8622a] text-white rounded-xl font-medium hover:bg-[#d45520] transition-colors duration-200"
            aria-label="Check-in giornaliero"
          >
            {today ? 'Aggiorna' : 'Check-in'}
          </button>
        </div>
      </div>

      {/* ── Primo accesso / nessun dato ──────────── */}
      {!today && (
        <button
          onClick={() => navigate('checkin')}
          className="w-full mb-5 px-5 py-4 bg-[#1a1a1a] text-white rounded-2xl text-left hover:bg-[#333] transition-colors duration-200"
          aria-label="Fai il tuo primo check-in"
        >
          <p className="text-sm font-medium mb-0.5">Inizia con un check-in →</p>
          <p className="text-xs text-[#aaa]">4 domande, meno di un minuto. I grafici si aggiornano subito.</p>
        </button>
      )}

      {/* Group name + decision banner */}
      {mode === 'gruppo' && groupName && (
        <p className="text-xs text-[#888] mb-3">{groupName}</p>
      )}
      {groupDecision && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          groupDecision.canDecide ? 'bg-[#e8f5ee] text-[#2d6a4f]' : 'bg-[#fde8e8] text-[#7d2d3a]'
        }`}>
          {groupDecision.canDecide
            ? `Gruppo stabile — ${groupDecision.stable} persone ok oggi`
            : `Attenzione: ${groupDecision.vulnerable} persone in difficoltà — rimanda decisioni importanti`}
        </div>
      )}

      {/* ── Stato del sistema ───────────────────── */}
      {today && (
        <div className="mb-5 bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[diagnosis.status]}`}>
                {diagnosis.tag}
              </span>
            </div>
            {today.stabilita < 2.5 && (
              <button
                onClick={() => navigate('impermanenza')}
                className="text-xs text-[#888] hover:text-[#555] underline underline-offset-2 transition-colors duration-200 flex-shrink-0"
              >
                apri Impermanenza
              </button>
            )}
          </div>
          <p className="text-sm text-[#666] leading-relaxed mb-4"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            {diagnosis.readout}
          </p>
          {/* Metriche */}
          <div className="grid grid-cols-2 gap-x-4">
            <MetricBar label="Sonno"     value={today.sonno}          prev={yesterday?.sonno} />
            <MetricBar label="Corpo"     value={today.corpo}          prev={yesterday?.corpo} />
            <MetricBar label="Stress"    value={6 - today.carico}     prev={yesterday ? 6 - yesterday.carico : undefined} />
            <MetricBar label="Relazioni" value={today.phi}            prev={yesterday?.phi} />
          </div>
          <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
            <MetricBar label="Stabilità complessiva" value={today.stabilita} prev={yesterday?.stabilita} />
          </div>
        </div>
      )}

      {/* ── Grafico corridoio ───────────────────── */}
      <div className="mb-5 bg-white rounded-2xl p-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <p className="text-xs text-[#bbb] mb-2 px-1">
          Ultimi 14 giorni — posizione nel corridoio psicofisico
        </p>
        <Corridor today={today} history={log} groupImports={groupImports} mode={mode} />
        <p className="text-[0.6rem] text-[#ddd] mt-2 px-1 text-right"
          style={{ fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
          dissoluzione · coscienza · sovraccarico
        </p>
      </div>

      {/* Group import/export */}
      {mode === 'gruppo' && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={async () => {
              if (!today) return;
              const { exportTodayJSON } = await import('../hooks/useGroup');
              const json = exportTodayJSON(today);
              try { await navigator.clipboard.writeText(json); }
              catch { const ta = document.createElement('textarea'); ta.value = json; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
              alert('Dati copiati');
            }}
            disabled={!today}
            className="flex-1 py-2.5 text-xs bg-[#f0f4f8] text-[#3d5a80] rounded-xl hover:bg-[#e0e8f0] transition-colors duration-200 disabled:opacity-40"
          >
            Copia dati del giorno
          </button>
          <label className="flex-1 py-2.5 text-xs bg-[#f0f4f8] text-[#3d5a80] rounded-xl hover:bg-[#e0e8f0] transition-colors duration-200 text-center cursor-pointer">
            Importa dati gruppo
            <input type="file" accept=".json" className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const text = await file.text();
                const { parseGroupJSON } = await import('../hooks/useGroup');
                const entries = parseGroupJSON(text);
                if (entries) { appState.importGroupData(entries); alert(`Importati ${entries.length} record`); }
                else alert('File non valido');
                e.target.value = '';
              }} />
          </label>
        </div>
      )}

      {/* ── Moduli ──────────────────────────────── */}
      <p className="text-xs text-[#bbb] mb-3 px-1">Moduli</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {MODULE_CARDS.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.screen)}
            className="p-4 bg-white rounded-2xl text-left hover:shadow-md transition-all duration-200"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            aria-label={card.label}
          >
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-base leading-none" style={{ color: card.accent, opacity: 0.7 }}>
                {card.icon}
              </span>
              <span className="text-sm font-medium text-[#1a1a1a]">{card.label}</span>
            </div>
            <p className="text-xs text-[#aaa] leading-snug">{card.desc}</p>
          </button>
        ))}

        {mode === 'gruppo' && (
          <button
            onClick={() => navigate('progetto')}
            className="p-4 bg-white rounded-2xl text-left hover:shadow-md transition-all duration-200"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            aria-label="Progetto Gruppo"
          >
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-base leading-none text-[#3d5a80] opacity-70">◎</span>
              <span className="text-sm font-medium text-[#1a1a1a]">Progetto Gruppo</span>
            </div>
            <p className="text-xs text-[#aaa] leading-snug">Posto fisico, problemi, semaforo decisionale</p>
          </button>
        )}

        <button
          onClick={() => appState.updateSettings({ darkMode: !settings.darkMode })}
          className="p-4 bg-white rounded-2xl text-left hover:shadow-md transition-all duration-200"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          aria-label="Cambia aspetto visivo"
        >
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-base leading-none text-[#bbb]">{settings.darkMode ? '◑' : '◐'}</span>
            <span className="text-sm font-medium text-[#bbb]">{settings.darkMode ? 'Tema chiaro' : 'Tema scuro'}</span>
          </div>
          <p className="text-xs text-[#ddd] leading-snug">Cambia aspetto visivo</p>
        </button>
      </div>

      <p className="text-xs text-[#ddd] text-center mt-2"
        style={{ fontFamily:"'JetBrains Mono','Courier New',monospace" }}>
        i tuoi dati restano sul dispositivo
      </p>
    </div>
  );
}
