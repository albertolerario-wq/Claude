import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

const OBJECTS = [
  { logR: -10.9,  logM: -27.04, label: 'e⁻',        cat: 'qm'      },
  { logR: -12.1,  logM: -23.78, label: 'p',           cat: 'qm'      },
  { logR: -8.3,   logM: -23.78, label: 'H',           cat: 'chem'    },
  { logR: -5.7,   logM: -17.5,  label: 'virus',       cat: 'chem'    },
  { logR: -4.0,   logM: -12.0,  label: 'batterio',    cat: 'life'    },
  { logR: -0.5,   logM: -2.5,   label: 'insetto',     cat: 'life'    },
  { logR:  2.1,   logM:  4.85,  label: 'UMANO',       cat: 'mind'    },
  { logR:  3.1,   logM:  7.7,   label: 'balena',      cat: 'life'    },
  { logR:  8.80,  logM: 27.78,  label: 'Terra',       cat: 'planet'  },
  { logR: 10.85,  logM: 33.30,  label: 'Sole',        cat: 'star'    },
  { logR:  6.00,  logM: 33.48,  label: 'NS',          cat: 'compact' },
  { logR: 12.08,  logM: 39.90,  label: 'Sgr A*',      cat: 'bh'      },
  { logR: 22.7,   logM: 45.3,   label: 'Via Lattea',  cat: 'cosmic'  },
  { logR: 28.5,   logM: 55.5,   label: 'r_Hubble',    cat: 'cosmic'  },
  { logR: -32.64, logM: -4.81,  label: 'Planck',      cat: 'planck'  },
];

const CAT_COLORS: Record<string, string> = {
  qm:      '#38bdf8',
  chem:    '#4ade80',
  life:    '#a78bfa',
  mind:    '#fb923c',
  planet:  '#94a3b8',
  star:    '#fcd34d',
  compact: '#f87171',
  bh:      '#7dd3fc',
  cosmic:  '#818cf8',
  planck:  '#e2e8f0',
};

const TOOLTIPS: Record<string, string> = {
  'e⁻':       'elettrone · limite quantistico',
  'p':         'protone · nucleo atomico',
  'H':         'atomo di idrogeno',
  'virus':     'virus · confine vivo/non vivo',
  'batterio':  'cellula batterica',
  'insetto':   'insetto medio',
  'UMANO':     '~70 kg · ~170 cm · picco φ_rel',
  'balena':    'balena blu · massimo animale noto',
  'Terra':     'pianeta Terra',
  'Sole':      'stella tipo G-V',
  'NS':        'stella di neutroni',
  'Sgr A*':    'buco nero centro Via Lattea',
  'Via Lattea':'galassia a spirale · ~10¹¹ stelle',
  'r_Hubble':  'raggio universo osservabile',
  'Planck':    'scala di Planck · limite QM+GR',
};

const X_DOMAIN: [number, number] = [-34, 30];
const Y_DOMAIN: [number, number] = [-8, 58];
const COMPACT_SHOW = new Set(['e⁻', 'batterio', 'UMANO', 'Sole', 'r_Hubble', 'Planck']);

interface Props {
  compact?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}

export default function CosmicPosition({ compact = false, onExpand, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { W, H, margin } = useMemo(() => {
    if (compact) {
      return { W: 200, H: 140, margin: { top: 6, right: 6, bottom: 12, left: 20 } };
    }
    return { W: 520, H: 420, margin: { top: 28, right: 24, bottom: 50, left: 52 } };
  }, [compact]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const svg = d3.select(el);
    svg.selectAll('*').remove();

    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('rect').attr('width', iW).attr('height', iH)
      .attr('fill', '#080810').attr('rx', compact ? 4 : 8);

    const xS = d3.scaleLinear().domain(X_DOMAIN).range([0, iW]);
    const yS = d3.scaleLinear().domain(Y_DOMAIN).range([iH, 0]);

    // Schwarzschild: logM = logR + 27.83
    const schwPts: [number, number][] = [];
    for (let r = X_DOMAIN[0]; r <= X_DOMAIN[1]; r++) {
      const m = r + 27.83;
      if (m >= Y_DOMAIN[0] && m <= Y_DOMAIN[1]) schwPts.push([r, m]);
    }

    // Compton: logM = -37.46 - logR
    const compPts: [number, number][] = [];
    for (let r = X_DOMAIN[0]; r <= X_DOMAIN[1]; r++) {
      const m = -37.46 - r;
      if (m >= Y_DOMAIN[0] && m <= Y_DOMAIN[1]) compPts.push([r, m]);
    }

    const line = d3.line<[number, number]>().x(d => xS(d[0])).y(d => yS(d[1]));

    // Forbidden zones
    if (schwPts.length > 1) {
      const zone = [...schwPts,
        [schwPts[schwPts.length-1][0], Y_DOMAIN[1]] as [number,number],
        [schwPts[0][0], Y_DOMAIN[1]] as [number,number]];
      g.append('polygon')
        .attr('points', zone.map(([r,m]) => `${xS(r)},${yS(m)}`).join(' '))
        .attr('fill', 'rgba(160,30,30,0.13)');
    }
    if (compPts.length > 1) {
      const zone = [...compPts,
        [compPts[compPts.length-1][0], Y_DOMAIN[0]] as [number,number],
        [compPts[0][0], Y_DOMAIN[0]] as [number,number]];
      g.append('polygon')
        .attr('points', zone.map(([r,m]) => `${xS(r)},${yS(m)}`).join(' '))
        .attr('fill', 'rgba(30,70,180,0.13)');
    }

    g.append('path').datum(schwPts).attr('d', line)
      .attr('fill','none').attr('stroke','#d97706')
      .attr('stroke-width', compact ? 0.8 : 1.2)
      .attr('stroke-dasharray','4,3').attr('opacity',0.75);

    g.append('path').datum(compPts).attr('d', line)
      .attr('fill','none').attr('stroke','#3b82f6')
      .attr('stroke-width', compact ? 0.8 : 1.2)
      .attr('stroke-dasharray','4,3').attr('opacity',0.75);

    if (!compact) {
      // Line labels
      const sl = schwPts[schwPts.length-1];
      if (sl) g.append('text').attr('x',xS(sl[0])-4).attr('y',yS(sl[1])-5)
        .attr('text-anchor','end').attr('font-size',7.5).attr('fill','#d97706')
        .attr('font-family',"'JetBrains Mono','Courier New',monospace").text('Schwarzschild');
      const cl = compPts[0];
      if (cl) g.append('text').attr('x',xS(cl[0])+4).attr('y',yS(cl[1])-5)
        .attr('font-size',7.5).attr('fill','#3b82f6')
        .attr('font-family',"'JetBrains Mono','Courier New',monospace").text('Compton');
    }

    // Corridoio label
    g.append('text').attr('x', xS(4)).attr('y', yS(22))
      .attr('text-anchor','middle').attr('font-size', compact ? 7 : 10)
      .attr('fill','#e8622a').attr('opacity',0.35)
      .attr('font-family',"'EB Garamond',Georgia,serif").text('corridoio');

    // Tooltip (full mode)
    type TTSel = d3.Selection<SVGGElement, unknown, null, undefined>;
    let ttG: TTSel | null = null;
    if (!compact) {
      ttG = g.append('g').style('display','none').attr('pointer-events','none');
      ttG.append('rect').attr('rx',3).attr('fill','#1a1a2e')
        .attr('stroke','#2a2a3e').attr('stroke-width',0.5);
      ttG.append('text').attr('class','ttl').attr('font-size',9).attr('fill','#dde')
        .attr('font-family',"'JetBrains Mono',monospace");
      ttG.append('text').attr('class','ttd').attr('font-size',7.5).attr('fill','#888')
        .attr('font-family',"'JetBrains Mono',monospace");
      ttG.append('text').attr('class','ttc').attr('font-size',7).attr('fill','#555')
        .attr('font-family',"'JetBrains Mono',monospace");
    }

    const visObjs = compact ? OBJECTS.filter(o => COMPACT_SHOW.has(o.label)) : OBJECTS;

    visObjs.forEach(obj => {
      const cx = xS(obj.logR), cy = yS(obj.logM);
      if (cx < -5 || cx > iW + 5 || cy < -5 || cy > iH + 5) return;

      const color = CAT_COLORS[obj.cat] ?? '#aaa';
      const isH = obj.label === 'UMANO';
      const r = isH ? (compact ? 3.5 : 5) : (compact ? 2 : 2.5);

      if (isH && !compact) {
        const defs = svg.select<SVGDefsElement>('defs').empty()
          ? svg.append<SVGDefsElement>('defs')
          : svg.select<SVGDefsElement>('defs');
        const grd = defs.append('radialGradient').attr('id','hGlow')
          .attr('cx','50%').attr('cy','50%').attr('r','50%');
        grd.append('stop').attr('offset','0%').attr('stop-color','#fb923c').attr('stop-opacity',0.35);
        grd.append('stop').attr('offset','100%').attr('stop-color','#fb923c').attr('stop-opacity',0);
        g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',26)
          .attr('fill','url(#hGlow)').attr('pointer-events','none');
      }

      if (isH) {
        g.append('circle').attr('cx',cx).attr('cy',cy).attr('r', r+3)
          .attr('fill','none').attr('stroke','#fb923c').attr('stroke-width',1)
          .attr('class','cosmic-pulse-ring').attr('pointer-events','none');
        g.append('circle').attr('cx',cx).attr('cy',cy).attr('r', r+3)
          .attr('fill','none').attr('stroke','#fb923c').attr('stroke-width',1)
          .attr('class','cosmic-pulse-ring-2').attr('pointer-events','none');
        g.append('text')
          .attr('x',cx).attr('y', cy - r - (compact ? 5 : 9))
          .attr('text-anchor','middle').attr('font-size', compact ? 6.5 : 9)
          .attr('fill','#fb923c').attr('font-weight','600')
          .attr('font-family',"'JetBrains Mono','Courier New',monospace")
          .attr('pointer-events','none')
          .text(compact ? 'TU' : 'TU SEI QUI');
      } else {
        const shortL: Record<string,string> = { 'r_Hubble': 'univ.' };
        g.append('text')
          .attr('x', cx + r + 2).attr('y', cy + 3)
          .attr('font-size', compact ? 6.5 : 8)
          .attr('fill', color).attr('opacity', 0.8)
          .attr('font-family',"'EB Garamond',Georgia,serif")
          .attr('pointer-events','none')
          .text(compact ? (shortL[obj.label] ?? obj.label) : obj.label);
      }

      const dot = g.append('circle').attr('cx',cx).attr('cy',cy).attr('r',r)
        .attr('fill',color).attr('opacity', isH ? 1 : 0.85);

      if (!compact && ttG) {
        dot.attr('cursor','pointer')
          .on('mouseenter', () => {
            const w = 150;
            ttG!.select('rect').attr('width',w).attr('height',40);
            ttG!.select('.ttl').attr('x',5).attr('y',13).text(obj.label);
            ttG!.select('.ttd').attr('x',5).attr('y',26).text(TOOLTIPS[obj.label]??'');
            ttG!.select('.ttc').attr('x',5).attr('y',38)
              .text(`logR=${obj.logR}  logM=${obj.logM}`);
            let tx = cx+10, ty = cy-48;
            if (tx+w > iW) tx = cx-w-10;
            if (ty < 0) ty = cy+10;
            ttG!.attr('transform',`translate(${tx},${ty})`).style('display',null);
          })
          .on('mouseleave', () => ttG?.style('display','none'));
      }
    });

    // Penrose annotation
    if (!compact) {
      const pl = OBJECTS.find(o => o.label==='Planck');
      if (pl) {
        const px = xS(pl.logR), py = yS(pl.logM);
        if (px >= 0 && py >= 0) {
          g.append('text').attr('x',px+8).attr('y',py-18)
            .attr('font-size',7.5).attr('fill','rgba(148,130,220,0.7)')
            .attr('font-family',"'EB Garamond',Georgia,serif").text('anomalia di Penrose');
          g.append('text').attr('x',px+8).attr('y',py-9)
            .attr('font-size',7).attr('fill','rgba(148,130,220,0.6)')
            .attr('font-family',"'JetBrains Mono',monospace").text('S₀ ≪ S_casuale');
          g.append('text').attr('x',px+8).attr('y',py)
            .attr('font-size',7).attr('fill','rgba(148,130,220,0.5)')
            .attr('font-family',"'JetBrains Mono',monospace").text('P ~ 10⁻¹⁰¹²³');
        }
      }

      // Axes
      [-30,-20,-10,0,10,20,30].forEach(v => {
        const x = xS(v);
        g.append('line').attr('x1',x).attr('x2',x).attr('y1',iH).attr('y2',iH+4).attr('stroke','#333');
        g.append('text').attr('x',x).attr('y',iH+14).attr('text-anchor','middle')
          .attr('font-size',7).attr('fill','#444').attr('font-family',"'JetBrains Mono',monospace").text(v);
      });
      [0,10,20,30,40,50].forEach(v => {
        const y = yS(v);
        g.append('line').attr('x1',0).attr('x2',-4).attr('y1',y).attr('y2',y).attr('stroke','#333');
        g.append('text').attr('x',-7).attr('y',y+3).attr('text-anchor','end')
          .attr('font-size',7).attr('fill','#444').attr('font-family',"'JetBrains Mono',monospace").text(v);
      });
      g.append('text').attr('x',iW/2).attr('y',iH+36)
        .attr('text-anchor','middle').attr('font-size',8.5).attr('fill','#555')
        .attr('font-family',"'JetBrains Mono',monospace").text('log R [cm]');
      g.append('text').attr('transform','rotate(-90)').attr('x',-iH/2).attr('y',-42)
        .attr('text-anchor','middle').attr('font-size',8.5).attr('fill','#555')
        .attr('font-family',"'JetBrains Mono',monospace").text('log M [g]');
    }
  }, [W, H, margin, compact]);

  if (compact) {
    return (
      <button
        onClick={onExpand}
        className="w-full rounded-lg overflow-hidden bg-[#080810] border border-[#1a1a28] hover:opacity-90 transition-opacity"
        style={{ height: 130 }}
        aria-label="Apri posizione cosmica"
        title="La tua posizione nel corridoio QM-GR"
      >
        <svg ref={svgRef} width="100%" height="100%" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#080810] flex flex-col overflow-y-auto"
      role="dialog" aria-modal="true" aria-label="Posizione cosmica">
      <div className="flex items-start justify-between px-5 py-4 flex-shrink-0">
        <div>
          <h1 className="text-lg text-[#d8d8e8]"
            style={{ fontFamily:"'EB Garamond',Georgia,serif", fontWeight:400 }}>
            dove sei nell'universo
          </h1>
          <p className="mt-0.5 text-[#444]"
            style={{ fontSize:'0.6rem', fontFamily:"'JetBrains Mono','Courier New',monospace" }}>
            corridoio QM–GR · scala logaritmica · il punto arancio sei tu
          </p>
        </div>
        <button onClick={onClose}
          className="p-2 text-[#555] hover:text-[#999] rounded-lg transition-colors mt-0.5"
          aria-label="Chiudi">✕</button>
      </div>

      <div className="px-2 pb-2 flex-shrink-0">
        <svg ref={svgRef} className="w-full" style={{ maxWidth: 540 }} />
      </div>

      <div className="px-5 pb-12 max-w-lg mx-auto">
        <div className="h-px bg-[#1a1a2e] mb-7" />
        <p className="text-sm leading-relaxed mb-5 text-[#7878a0]"
          style={{ fontFamily:"'EB Garamond',Georgia,serif" }}>
          Sei posizionato nel corridoio fisico tra il limite quantistico e il limite
          gravitazionale — la striscia in cui la materia può formare strutture stabili
          abbastanza complesse da elaborare informazione.
        </p>
        <p className="text-sm leading-relaxed mb-5 text-[#7878a0]"
          style={{ fontFamily:"'EB Garamond',Georgia,serif" }}>
          La tua massa (~70 kg) e la tua scala (~1.7 m) ti collocano nel punto di
          massima integrazione relazionale possibile nella biologia conosciuta.
          Non agli estremi — al picco.
        </p>
        <p className="text-sm leading-relaxed mb-5 text-[#7878a0]"
          style={{ fontFamily:"'EB Garamond',Georgia,serif" }}>
          Quello che chiami 'io' è una struttura dissipativa temporanea in un corridoio
          fisico stretto, in un universo partito da condizioni anomalmente ordinate per
          ragioni che la fisica non sa ancora spiegare.
        </p>
        <p className="text-sm leading-relaxed text-[#9090c0] italic"
          style={{ fontFamily:"'EB Garamond',Georgia,serif" }}>
          Sei un modo che l'universo ha trovato per conoscersi.
        </p>
      </div>
    </div>
  );
}
