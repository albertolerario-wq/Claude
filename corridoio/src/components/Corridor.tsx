import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DailyEntry } from '../types';
import { getGroupDiagnosis } from '../hooks/useDiagnosis';

interface Props {
  today: DailyEntry | null;
  history: DailyEntry[];
  groupImports: DailyEntry[][];
  mode: 'solo' | 'gruppo';
}

export default function Corridor({ today, history, groupImports, mode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = 420, H = 340;
    const margin = { top: 24, right: 24, bottom: 40, left: 44 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 5]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 5]).range([innerH, 0]);

    // Background
    g.append('rect').attr('width', innerW).attr('height', innerH).attr('fill', '#fafaf8').attr('rx', 4);

    // Zone: dissoluzione (bottom-left, low phi + low stabilita)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(2.5))
      .attr('width', xScale(2.5))
      .attr('height', innerH - yScale(2.5))
      .attr('fill', '#b8c8e0')
      .attr('opacity', 0.25);

    // Zone: sovraccarico (top-right, high stabilita but low phi? Actually high load)
    g.append('rect')
      .attr('x', xScale(2.5))
      .attr('y', 0)
      .attr('width', innerW - xScale(2.5))
      .attr('height', yScale(3.5))
      .attr('fill', '#e8b4a0')
      .attr('opacity', 0.2);

    // Zone: coscienza (radial gradient center-right)
    const defs = svg.append('defs');
    const radialId = 'coscienza-gradient';
    const radial = defs.append('radialGradient')
      .attr('id', radialId)
      .attr('cx', '60%').attr('cy', '40%')
      .attr('r', '45%');
    radial.append('stop').attr('offset', '0%').attr('stop-color', '#e8622a').attr('stop-opacity', 0.18);
    radial.append('stop').attr('offset', '100%').attr('stop-color', '#e8622a').attr('stop-opacity', 0);

    g.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', `url(#${radialId})`);

    // Zone labels
    g.append('text')
      .attr('x', 6).attr('y', innerH - 6)
      .attr('font-size', 9).attr('fill', '#3d5a80').attr('opacity', 0.6)
      .text('dissoluzione');
    g.append('text')
      .attr('x', innerW - 4).attr('y', 12)
      .attr('text-anchor', 'end')
      .attr('font-size', 9).attr('fill', '#c84b2a').attr('opacity', 0.6)
      .text('sovraccarico');
    g.append('text')
      .attr('x', innerW * 0.65).attr('y', innerH * 0.4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9).attr('fill', '#e8622a').attr('opacity', 0.5)
      .text('zona di coscienza');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(0);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(0);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call(ax => ax.select('.domain').attr('stroke', '#ddd'))
      .call(ax => ax.selectAll('text').attr('font-size', 9).attr('fill', '#999'));

    g.append('g')
      .call(yAxis)
      .call(ax => ax.select('.domain').attr('stroke', '#ddd'))
      .call(ax => ax.selectAll('text').attr('font-size', 9).attr('fill', '#999'));

    // Axis labels
    g.append('text')
      .attr('x', innerW / 2).attr('y', innerH + 34)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#888')
      .text('φ_rel (integrazione relazionale)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -34)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#888')
      .text('stabilità');

    // Grid lines
    xScale.ticks(5).forEach(v => {
      g.append('line')
        .attr('x1', xScale(v)).attr('x2', xScale(v))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', '#eee').attr('stroke-dasharray', '2,3');
    });
    yScale.ticks(5).forEach(v => {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', yScale(v)).attr('y2', yScale(v))
        .attr('stroke', '#eee').attr('stroke-dasharray', '2,3');
    });

    // 14-day history trail
    const trail = history.slice(0, 14).reverse();
    if (trail.length > 1) {
      const line = d3.line<DailyEntry>()
        .x(d => xScale(d.phi))
        .y(d => yScale(d.stabilita))
        .curve(d3.curveCatmullRom);
      g.append('path')
        .datum(trail)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#e8622a')
        .attr('stroke-width', 1)
        .attr('opacity', 0.2);
    }
    trail.forEach((d, i) => {
      const opacity = (i + 1) / trail.length * 0.5;
      g.append('circle')
        .attr('cx', xScale(d.phi)).attr('cy', yScale(d.stabilita))
        .attr('r', 4)
        .attr('fill', '#e8622a')
        .attr('opacity', opacity);
    });

    // Group mode overlay
    if (mode === 'gruppo' && groupImports.length > 0) {
      // Get latest import batch
      const latestBatch = groupImports[groupImports.length - 1];
      const groupDx = getGroupDiagnosis(latestBatch);

      // Lines from members to centroid
      if (latestBatch.length > 1) {
        latestBatch.forEach(m => {
          g.append('line')
            .attr('x1', xScale(m.phi)).attr('y1', yScale(m.stabilita))
            .attr('x2', xScale(groupDx.centroid.phi)).attr('y2', yScale(groupDx.centroid.stabilita))
            .attr('stroke', '#3d5a80').attr('stroke-width', 0.8).attr('opacity', 0.25)
            .attr('stroke-dasharray', '3,3');
        });
      }

      // Member dots
      latestBatch.forEach(m => {
        const cx = xScale(m.phi);
        const cy = yScale(m.stabilita);
        g.append('circle')
          .attr('cx', cx).attr('cy', cy).attr('r', 6)
          .attr('fill', '#3d5a80').attr('opacity', 0.7).attr('stroke', 'white').attr('stroke-width', 1.5);
        g.append('text')
          .attr('x', cx).attr('y', cy - 9)
          .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#3d5a80')
          .text(m.nickname ?? '');
      });

      // Centroid
      const cx2 = xScale(groupDx.centroid.phi);
      const cy2 = yScale(groupDx.centroid.stabilita);
      g.append('circle')
        .attr('cx', cx2).attr('cy', cy2).attr('r', 9)
        .attr('fill', '#7d2d3a').attr('opacity', 0.85).attr('stroke', 'white').attr('stroke-width', 2);
    }

    // Today point with pulse rings
    if (today) {
      const cx = xScale(today.phi);
      const cy = yScale(today.stabilita);

      // Pulse rings (CSS animated via classes)
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 10)
        .attr('fill', '#e8622a').attr('opacity', 0.15)
        .attr('class', 'pulse-ring');
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 10)
        .attr('fill', '#e8622a').attr('opacity', 0.1)
        .attr('class', 'pulse-ring pulse-ring-delay');

      // Main dot
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 7)
        .attr('fill', '#e8622a').attr('stroke', 'white').attr('stroke-width', 2);

      // Label
      g.append('text')
        .attr('x', cx).attr('y', cy - 12)
        .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#e8622a').attr('font-weight', '600')
        .text('oggi');
    }
  }, [today, history, groupImports, mode]);

  return (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ maxHeight: 340 }}
      aria-label="Grafico corridoio: posizione nel sistema"
      role="img"
    />
  );
}
