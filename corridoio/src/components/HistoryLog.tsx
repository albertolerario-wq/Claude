import { useRef, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { NavProps } from '../App';
import { getDiagnosis } from '../hooks/useDiagnosis';
import type { MomentoEvent } from '../types';

function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek = new Date(jan4);
  startOfWeek.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = d.getTime() - startOfWeek.getTime();
  const week = Math.floor(diff / (7 * 86400000)) + 1;
  return `W${week.toString().padStart(2, '0')}`;
}

export default function HistoryLog({ navigate, appState }: NavProps) {
  const { state, exportData, importData, clearData } = appState;
  const { log } = state;
  const momentoLog: MomentoEvent[] = state.momentoLog ?? [];
  const fileRef = useRef<HTMLInputElement>(null);

  const momentoWeeks = useMemo(() => {
    if (momentoLog.length === 0) return [];
    const byWeek: Record<string, { week: string; ansia: number; noia: number; abitudine: number }> = {};
    momentoLog.forEach(ev => {
      const w = getISOWeek(ev.date);
      if (!byWeek[w]) byWeek[w] = { week: w, ansia: 0, noia: 0, abitudine: 0 };
      byWeek[w][ev.reason]++;
    });
    return Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);
  }, [momentoLog]);

  const last30 = log.slice(0, 30).reverse().map(e => ({
    date: e.date.slice(5),
    stabilita: parseFloat(e.stabilita.toFixed(2)),
  }));

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corridoio-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = importData(text);
    if (!ok) alert('File non valido');
    e.target.value = '';
  }

  function handleClear() {
    if (window.confirm('Cancellare tutti i dati? Questa azione non è reversibile.')) {
      clearData();
    }
  }

  const statusColors = {
    stable: 'bg-[#e8f5ee] text-[#2d6a4f]',
    warn: 'bg-[#fff3e0] text-[#c8860a]',
    loop: 'bg-[#fde8e8] text-[#7d2d3a]',
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 py-4 mb-2">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Log storico</h1>
        <span className="ml-auto text-xs text-[#aaa]">{log.length} record</span>
      </div>

      {/* Trend chart */}
      {last30.length >= 2 && (
        <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-xs text-[#888] mb-3">Stabilità — 30 giorni</h2>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={last30} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [typeof v === 'number' ? v.toFixed(2) : '-', 'stabilità']}
              />
              <Line type="monotone" dataKey="stabilita" stroke="#e8622a" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExport}
          className="flex-1 py-2.5 text-xs bg-white border border-[#ddd] text-[#555] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200"
          aria-label="Esporta dati JSON"
        >
          Esporta JSON
        </button>
        <label className="flex-1 py-2.5 text-xs bg-white border border-[#ddd] text-[#555] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200 text-center cursor-pointer" aria-label="Importa dati JSON">
          Importa JSON
          <input ref={fileRef} type="file" accept=".json" className="sr-only" onChange={handleImport} />
        </label>
        <button
          onClick={handleClear}
          className="flex-1 py-2.5 text-xs bg-white border border-[#f5c0c0] text-[#c84b2a] rounded-lg hover:bg-[#fde8e8] transition-colors duration-200"
          aria-label="Cancella tutti i dati"
        >
          Cancella dati
        </button>
      </div>

      {/* Momento pattern chart */}
      {momentoWeeks.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-xs text-[#888] mb-3">pattern di apertura — ultime settimane</h2>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={momentoWeeks} margin={{ top: 2, right: 2, bottom: 0, left: 0 }} barSize={12}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#bbb' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => [v, name]}
              />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
              <Bar dataKey="ansia"     fill="#e8622a" stackId="a" />
              <Bar dataKey="noia"      fill="#3d5a80" stackId="a" />
              <Bar dataKey="abitudine" fill="#aaa"    stackId="a" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log list */}
      {log.length === 0 ? (
        <p className="text-sm text-[#aaa] text-center py-8">Nessun dato</p>
      ) : (
        <div className="space-y-2">
          {log.map(entry => {
            const dx = getDiagnosis(entry);
            return (
              <div
                key={entry.date}
                className="bg-white rounded-xl p-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-[#1a1a1a]">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('it-IT', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {entry.nickname && (
                      <span className="ml-2 text-xs text-[#888]">{entry.nickname}</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[dx.status]}`}>
                    {dx.tag}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: 'sonno', value: entry.sonno },
                    { label: 'corpo', value: entry.corpo },
                    { label: 'carico', value: entry.carico },
                    { label: 'φ', value: entry.phi },
                    { label: 'stab.', value: entry.stabilita.toFixed(1) },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="text-xs text-[#aaa]">{m.label}</div>
                      <div className="text-sm font-medium text-[#1a1a1a]">{m.value}</div>
                    </div>
                  ))}
                </div>

                {entry.note && (
                  <p className="text-xs text-[#888] mt-2 pt-2 border-t border-[#f0f0f0] line-clamp-2"
                     style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                    {entry.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
