import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { NavProps } from '../App';
import { linearRegression } from '../hooks/useDiagnosis';

const METRICS = [
  { key: 'sonno', label: 'Sonno', color: '#3d5a80' },
  { key: 'corpo', label: 'Corpo', color: '#2d6a4f' },
  { key: 'stabilita', label: 'Stabilità', color: '#e8622a' },
  { key: 'phi', label: 'φ_rel', color: '#7d2d3a' },
] as const;

function SlopeIndicator({ slope }: { slope: number }) {
  if (Math.abs(slope) < 0.001) {
    return <span className="text-xs text-[#888]">→ stabile</span>;
  }
  if (slope > 0) {
    return <span className="text-xs text-[#2d6a4f]">↑ +{(slope * 30).toFixed(2)}/mese</span>;
  }
  return <span className="text-xs text-[#c8860a]">↓ {(slope * 30).toFixed(2)}/mese</span>;
}

export default function InteresseComposto({ navigate, appState }: NavProps) {
  const { state } = appState;
  const { log } = state;

  const data90 = log.slice(0, 90).reverse().map(e => ({
    date: e.date.slice(5),
    sonno: e.sonno,
    corpo: e.corpo,
    stabilita: parseFloat(e.stabilita.toFixed(2)),
    phi: e.phi,
  }));

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 py-4 mb-2">
        <button onClick={() => navigate('home')} className="p-2 rounded-lg hover:bg-[#eee] transition-colors duration-200" aria-label="Torna">←</button>
        <h1 className="text-lg font-medium text-[#1a1a1a]">Interesse Composto</h1>
      </div>

      <p className="text-sm text-[#888] mb-5 leading-relaxed" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
        La direzione conta più della posizione.
      </p>

      {data90.length < 2 ? (
        <div className="bg-white rounded-xl p-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-sm text-[#aaa]">Dati insufficienti. Serve almeno 2 check-in per calcolare la tendenza.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {METRICS.map(metric => {
            const values = data90.map(d => d[metric.key] as number);
            const slope = linearRegression(values);

            return (
              <div
                key={metric.key}
                className="bg-white rounded-xl p-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-[#1a1a1a]">{metric.label}</h2>
                  <SlopeIndicator slope={slope} />
                </div>

                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={data90} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11, padding: '4px 8px', borderRadius: 6,
                        border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => [typeof v === 'number' ? v.toFixed(1) : '-', metric.label]}
                    />
                    <ReferenceLine y={3} stroke="#eee" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* Formula */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[#aaa] font-mono">C × (1 + i/100)^t = M</p>
        <p className="text-xs text-[#aaa] mt-1 leading-relaxed">
          piccoli miglioramenti costanti producono risultati che il cervello non riesce a percepire in tempo reale
        </p>
      </div>
    </div>
  );
}
