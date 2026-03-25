import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Props {
  onClose: () => void;
}

export default function CosmicDiagram({ onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = 500, H = 420;
    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Background
    g.append('rect').attr('width', iW).attr('height', iH).attr('fill', '#0a0a14').attr('rx', 4);

    // Log scales
    const xScale = d3.scaleLog().domain([1e-20, 1e60]).range([0, iW]);
    const yScale = d3.scaleLog().domain([1e-20, 1e60]).range([iH, 0]);

    // Compton limit: R = ℏ/(Mc) — mass-radius relationship
    // Below this: quantum zone
    const comptonPoints: [number, number][] = [];
    for (let logM = -20; logM <= 60; logM += 2) {
      const M = Math.pow(10, logM);
      const R = 1.05e-34 / (M * 3e8); // ℏ/Mc
      if (R > 1e-20 && R < 1e60) comptonPoints.push([M, R]);
    }

    // Schwarzschild limit: R = 2GM/c²
    const schwarPoints: [number, number][] = [];
    for (let logM = -20; logM <= 60; logM += 2) {
      const M = Math.pow(10, logM);
      const R = 2 * 6.674e-11 * M / (9e16); // 2GM/c²
      if (R > 1e-20 && R < 1e60) schwarPoints.push([M, R]);
    }

    const lineGen = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .defined(d => d[0] > 0 && d[1] > 0);

    // Compton line
    g.append('path')
      .datum(comptonPoints)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#3d5a80')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .attr('stroke-dasharray', '4,3');

    // Schwarzschild line
    g.append('path')
      .datum(schwarPoints)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#7d2d3a')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .attr('stroke-dasharray', '4,3');

    // Corridoio zone — between the two limits
    g.append('text').attr('x', iW * 0.45).attr('y', iH * 0.42)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#e8622a').attr('opacity', 0.7)
      .attr('font-family', 'EB Garamond, serif')
      .text('corridoio');

    // Hierarchy points (approximate positions on log scale)
    const hierarchy = [
      { label: 'particelle', M: 1e-30, R: 1e-15, color: '#aaa' },
      { label: 'atomi', M: 1e-26, R: 1e-10, color: '#aaa' },
      { label: 'molecole', M: 1e-23, R: 1e-9, color: '#aaa' },
      { label: 'vita', M: 1e-15, R: 1e-6, color: '#2d6a4f' },
      { label: 'mente', M: 70, R: 0.2, color: '#e8622a' },
      { label: 'cultura', M: 1e12, R: 1e6, color: '#c8860a' },
    ];

    hierarchy.forEach(h => {
      if (h.M < 1e-20 || h.M > 1e60 || h.R < 1e-20 || h.R > 1e60) return;
      const cx = xScale(h.M);
      const cy = yScale(h.R);
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 3)
        .attr('fill', h.color).attr('opacity', 0.8);
      g.append('text').attr('x', cx + 5).attr('y', cy + 3)
        .attr('font-size', 9).attr('fill', h.color).attr('opacity', 0.7)
        .attr('font-family', 'EB Garamond, serif')
        .text(h.label);
    });

    // Penrose anomaly annotation
    const penroseX = iW * 0.12;
    const penroseY = iH * 0.15;
    g.append('text').attr('x', penroseX).attr('y', penroseY)
      .attr('font-size', 8).attr('fill', '#888').attr('font-family', 'EB Garamond, serif')
      .text('anomalia di Penrose');
    g.append('text').attr('x', penroseX).attr('y', penroseY + 12)
      .attr('font-size', 7).attr('fill', '#555').attr('font-family', 'EB Garamond, serif')
      .text('S₀ ≪ S_casuale');
    g.append('text').attr('x', penroseX).attr('y', penroseY + 22)
      .attr('font-size', 7).attr('fill', '#444').attr('font-family', 'monospace')
      .text('P ~ 10^{-10^123}');

    // Labels
    g.append('text').attr('x', iW - 5).attr('y', iH * 0.2)
      .attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#7d2d3a').attr('opacity', 0.7)
      .text('limite di Schwarzschild');
    g.append('text').attr('x', 5).attr('y', iH * 0.85)
      .attr('font-size', 9).attr('fill', '#3d5a80').attr('opacity', 0.7)
      .text('limite di Compton');

    // Axis ticks (minimal, log scale)
    const xTicks = [-20, -10, 0, 10, 20, 30, 40, 50, 60].map(e => Math.pow(10, e));
    const yTicks = [-20, -10, 0, 10, 20, 30, 40, 50, 60].map(e => Math.pow(10, e));

    xTicks.forEach(v => {
      const x = xScale(v);
      g.append('line').attr('x1', x).attr('x2', x).attr('y1', iH).attr('y2', iH + 4)
        .attr('stroke', '#333');
    });
    yTicks.forEach(v => {
      const y = yScale(v);
      g.append('line').attr('x1', 0).attr('x2', -4).attr('y1', y).attr('y2', y)
        .attr('stroke', '#333');
    });

    // Axis labels
    g.append('text').attr('x', iW / 2).attr('y', iH + 36)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#888')
      .attr('font-family', 'EB Garamond, serif')
      .text('Massa (kg)');
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -iH / 2).attr('y', -44)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#888')
      .attr('font-family', 'EB Garamond, serif')
      .text('Raggio (m)');

  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0a14] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Diagramma cosmologico"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h1
            className="text-xl text-[#e8e8e8]"
            style={{ fontFamily: "'EB Garamond', Georgia, serif", fontWeight: 400 }}
          >
            Diagramma massa-raggio
          </h1>
          <p className="text-xs text-[#555] mt-0.5">Il corridoio che permette la vita biologica</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#555] hover:text-[#999] rounded-lg transition-colors duration-200"
          aria-label="Chiudi diagramma"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <svg ref={svgRef} className="w-full" style={{ maxWidth: 500, maxHeight: 420 }} />
      </div>

      <div className="px-5 pb-6 text-center">
        <p
          className="text-sm text-[#555] leading-relaxed max-w-sm mx-auto"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        >
          La gerarchia emergente: fisica → chimica → vita → mente → cultura.
          φ_rel cresce lungo questo asse. La coscienza è il picco locale.
        </p>
      </div>
    </div>
  );
}
