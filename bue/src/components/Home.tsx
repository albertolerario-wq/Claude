import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { useAppState } from '../hooks/useAppState';
import { STADI } from '../data/stadi';

type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

interface Props {
  appState: ReturnType<typeof useAppState>;
  navigate: (s: Screen) => void;
}

async function shareApp() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Bue', text: 'pratica zen quotidiana', url });
    } catch { /* cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(url); alert('Link copiato'); } catch { /* ignore */ }
  }
}

export default function Home({ appState, navigate }: Props) {
  const { state, setStage } = appState;
  const svgRef = useRef<SVGSVGElement>(null);

  const SIZE = 300;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_ORBIT = 108;
  const R_NODE = 13;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Outer enso circle (hand-drawn feel via dasharray)
    svg.append('circle')
      .attr('cx', CX).attr('cy', CY)
      .attr('r', R_ORBIT + 28)
      .attr('fill', 'none')
      .attr('stroke', '#2a2620')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3');

    // Stage nodes
    STADI.forEach((stadio, i) => {
      const angleRad = ((stadio.angolo - 90) * Math.PI) / 180;
      const x = CX + R_ORBIT * Math.cos(angleRad);
      const y = CY + R_ORBIT * Math.sin(angleRad);

      const isVisited = state.visitedStages.includes(i);
      const isCurrent = state.currentStage === i;

      const g = svg.append('g')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setStage(i);
          navigate('stage');
        });

      // Node circle
      g.append('circle')
        .attr('r', R_NODE)
        .attr('fill', isCurrent ? '#c85428' : isVisited ? '#3a3028' : '#1a1810')
        .attr('stroke', isCurrent ? '#c85428' : isVisited ? '#6a5840' : '#2a2620')
        .attr('stroke-width', isCurrent ? 1.5 : 1);

      // Kanji
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isCurrent ? '#f0e8d8' : isVisited ? '#8a7860' : '#4a4040')
        .attr('font-size', '11px')
        .attr('font-family', "'EB Garamond', Georgia, serif")
        .text(stadio.kanji);

      // Number label (outside)
      const labelDist = R_NODE + 10;
      const lx = labelDist * Math.cos(angleRad);
      const ly = labelDist * Math.sin(angleRad);
      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#3a3228')
        .attr('font-size', '8px')
        .attr('font-family', "'EB Garamond', Georgia, serif")
        .text(stadio.numero);
    });

    // Center: enso (open circle, hand-made aesthetic)
    const ensoG = svg.append('g')
      .attr('transform', `translate(${CX},${CY})`)
      .style('cursor', 'pointer')
      .on('click', () => navigate('silenzio'));

    ensoG.append('circle')
      .attr('r', 26)
      .attr('fill', 'none')
      .attr('stroke', '#c85428')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '144 18')
      .attr('stroke-linecap', 'round')
      .attr('transform', 'rotate(-20)');

    ensoG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#4a3828')
      .attr('font-size', '9px')
      .attr('font-family', "'EB Garamond', Georgia, serif")
      .attr('letter-spacing', '0.05em')
      .text('silenzio');

  }, [state.visitedStages, state.currentStage, setStage, navigate]);

  const currentStadio = STADI[state.currentStage];

  return (
    <div className="max-w-lg mx-auto px-5 pb-24 pt-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-normal leading-none"
            style={{ fontFamily: "'EB Garamond', Georgia, serif", color: '#d8d0c0' }}
          >
            Bue
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#4a4640', letterSpacing: '0.08em', marginTop: '2px' }}>
            十牛図
          </p>
        </div>
        <button
          onClick={shareApp}
          style={{
            fontSize: '0.7rem',
            color: '#4a4640',
            letterSpacing: '0.06em',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #2a2620',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          condividi
        </button>
      </div>

      {/* Ox-wheel SVG */}
      <div className="flex justify-center mb-6">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: 'visible' }}
          aria-label="Ruota dei dieci stadi"
        />
      </div>

      {/* Current stage card */}
      <div
        className="mb-5 p-5 rounded-xl cursor-pointer transition-all duration-200"
        style={{
          background: '#131109',
          border: '1px solid #2a2620',
        }}
        onClick={() => navigate('stage')}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('stage')}
        aria-label={`Stadio corrente: ${currentStadio.titolo}`}
      >
        <div className="flex items-baseline gap-3 mb-2">
          <span style={{ fontSize: '1.4rem', color: '#4a3828', fontFamily: "'EB Garamond'" }}>
            {currentStadio.kanji}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#4a4640', letterSpacing: '0.06em' }}>
            {currentStadio.numero} / 10
          </span>
        </div>
        <p style={{ color: '#8a7860', fontSize: '0.95rem', marginBottom: '6px' }}>
          {currentStadio.titolo}
        </p>
        <p
          style={{
            color: '#6a6050',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            fontStyle: 'italic',
          }}
        >
          {currentStadio.descrizione.split('. ')[0]}.
        </p>
      </div>

      {/* Intro text for newcomers */}
      {state.visitedStages.length === 0 && (
        <div
          className="mb-5 p-5 rounded-xl"
          style={{ background: '#131109', border: '1px solid #2a2620' }}
        >
          <p style={{ color: '#6a6050', fontSize: '0.85rem', lineHeight: '1.75' }}>
            Tocca uno stadio nel cerchio per esplorarlo.<br />
            Apri un koan. Siediti in silenzio.<br />
            Non c'è percorso giusto. Non c'è traguardo.
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('koan')}
          className="flex-1 py-3 rounded-xl transition-all duration-200"
          style={{
            background: '#131109',
            border: '1px solid #2a2620',
            color: '#8a7860',
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
          }}
        >
          koan
        </button>
        <button
          onClick={() => navigate('silenzio')}
          className="flex-1 py-3 rounded-xl transition-all duration-200"
          style={{
            background: '#131109',
            border: '1px solid #2a2620',
            color: '#8a7860',
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
          }}
        >
          silenzio
        </button>
      </div>
    </div>
  );
}
