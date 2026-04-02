import { useState } from 'react';
import type { NavProps } from '../App';

type Step = 'ack' | 'true' | 'end-false' | 'can-act' | 'action' | 'end-action' | 'accept' | 'end-accept';

export default function Flowchart({ navigate }: NavProps) {
  const [step, setStep] = useState<Step>('ack');
  const [what, setWhat] = useState('');
  const [action, setAction] = useState('');
  const [commit, setCommit] = useState('');

  const serif = { fontFamily: "'EB Garamond',Georgia,serif" };
  const mono  = { fontFamily: "'JetBrains Mono','Courier New',monospace" };

  function reset() {
    setStep('ack'); setWhat(''); setAction(''); setCommit('');
  }

  return (
    <div className="max-w-lg mx-auto px-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 py-5 mb-2">
        <button onClick={() => navigate('home')}
          className="p-2 rounded-lg hover:bg-[#eee] transition-colors" aria-label="Torna">
          ←
        </button>
        <div>
          <h1 className="text-base font-medium text-[#1a1a1a]" style={serif}>In difficoltà</h1>
          <p className="text-xs text-[#999]" style={mono}>tre domande</p>
        </div>
      </div>

      {/* Progress dots */}
      {!['end-false','end-action','end-accept'].includes(step) && (
        <div className="flex gap-1.5 mb-8">
          {['ack','true','can-act','action'].map((s, i) => {
            const steps = ['ack','true','can-act','action','accept'];
            const cur = steps.indexOf(step);
            return (
              <div key={s} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                i <= cur ? 'bg-[#1a1a1a]' : 'bg-[#e0e0e0]'
              }`} />
            );
          })}
        </div>
      )}

      {/* STEP 0: Acknowledge */}
      {step === 'ack' && (
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs text-[#aaa] uppercase tracking-widest" style={mono}>passo 1 — riconosci</p>
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Cosa sta succedendo?
            </p>
            <p className="text-sm text-[#888] leading-relaxed" style={serif}>
              Non serve essere precisi. Basta nominarlo.
            </p>
          </div>
          <textarea
            value={what}
            onChange={e => setWhat(e.target.value)}
            placeholder="scrivi o lascia vuoto e continua"
            rows={3}
            className="w-full bg-transparent border border-[#e0e0e0] rounded-xl p-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] resize-none"
          />
          <button onClick={() => setStep('true')}
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
            continua
          </button>
        </div>
      )}

      {/* STEP 1: Is it true? */}
      {step === 'true' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs text-[#aaa] uppercase tracking-widest" style={mono}>passo 2 — verifica</p>
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              È vero?
            </p>
            <p className="text-sm text-[#666] leading-relaxed" style={serif}>
              Il trigger non è l'evento — è il pensiero sull'evento,
              filtrato da condizionamenti, stanchezza, aspettative.
            </p>
            <p className="text-sm text-[#333] leading-relaxed" style={serif}>
              Questo pensiero corrisponde a qualcosa che sta realmente
              accadendo adesso — non a una proiezione, non a una storia?
            </p>
          </div>
          {what && (
            <p className="text-xs text-[#aaa] px-4 py-3 bg-[#f7f7f5] rounded-lg italic" style={serif}>
              "{what}"
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button onClick={() => setStep('can-act')}
              className="w-full py-4 border border-[#1a1a1a] text-[#1a1a1a] rounded-xl text-sm hover:bg-[#f5f5f5] transition-colors">
              sì, è reale
            </button>
            <button onClick={() => setStep('end-false')}
              className="w-full py-4 border border-[#ddd] text-[#777] rounded-xl text-sm hover:bg-[#f9f9f9] transition-colors">
              no, non sono sicuro
            </button>
          </div>
        </div>
      )}

      {/* END A: Not true */}
      {step === 'end-false' && (
        <div className="space-y-8 py-4">
          <div className="space-y-5">
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Non c'è nulla di reale a cui rispondere.
            </p>
            <p className="text-base leading-relaxed text-[#555]" style={serif}>
              Il sistema nervoso non distingue tra pericolo reale
              e pensiero. Genera la stessa risposta fisiologica.
            </p>
            <p className="text-base leading-relaxed text-[#555]" style={serif}>
              Ma tu puoi notare la differenza tra i due.
              Notarla è sufficiente.
            </p>
            <p className="text-xs text-[#bbb]" style={mono}>
              Non serve fare altro adesso.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('home')}
              className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
              torna alla home
            </button>
            <button onClick={reset}
              className="py-4 px-5 border border-[#ddd] text-[#888] rounded-xl text-sm hover:bg-[#f5f5f5] transition-colors">
              ↺
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Can you act? */}
      {step === 'can-act' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs text-[#aaa] uppercase tracking-widest" style={mono}>passo 3 — azione</p>
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Cosa puoi fare?
            </p>
            <p className="text-sm text-[#666] leading-relaxed" style={serif}>
              C'è qualcosa di concreto che puoi fare adesso
              per cambiare la situazione?
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setStep('action')}
              className="w-full py-4 border border-[#1a1a1a] text-[#1a1a1a] rounded-xl text-sm hover:bg-[#f5f5f5] transition-colors">
              sì, posso fare qualcosa
            </button>
            <button onClick={() => setStep('accept')}
              className="w-full py-4 border border-[#ddd] text-[#777] rounded-xl text-sm hover:bg-[#f9f9f9] transition-colors">
              no, non posso cambiarlo
            </button>
          </div>
        </div>
      )}

      {/* STEP 2a: Action planner */}
      {step === 'action' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs text-[#aaa] uppercase tracking-widest" style={mono}>azione concreta</p>
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Scrivi una cosa.
            </p>
            <p className="text-sm text-[#888] leading-relaxed" style={serif}>
              Concreta. Fattibile oggi. Una sola.
            </p>
          </div>
          <textarea
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder=""
            rows={3}
            className="w-full bg-transparent border border-[#e0e0e0] rounded-xl p-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] resize-none"
          />
          <button onClick={() => setStep('end-action')}
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
            fatto
          </button>
        </div>
      )}

      {/* END B: Action planned */}
      {step === 'end-action' && (
        <div className="space-y-8 py-4">
          {action && (
            <p className="text-xs text-[#aaa] px-4 py-3 bg-[#f7f7f5] rounded-lg" style={{ ...mono, textDecoration:'line-through' }}>
              {action}
            </p>
          )}
          <div className="space-y-5">
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Il cervello è in modalità problem-solving.
            </p>
            <p className="text-base leading-relaxed text-[#555]" style={serif}>
              Non è lo stesso di stare fermi a preoccuparsi.
              Il default mode network si è spento.
              Il sistema è in movimento.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('home')}
              className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
              torna alla home
            </button>
            <button onClick={reset}
              className="py-4 px-5 border border-[#ddd] text-[#888] rounded-xl text-sm hover:bg-[#f5f5f5] transition-colors">
              ↺
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Accept and commit */}
      {step === 'accept' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-[#aaa] uppercase tracking-widest" style={mono}>accettazione attiva</p>
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Non puoi cambiare la situazione.
            </p>
            <p className="text-sm text-[#666] leading-relaxed" style={serif}>
              Questa è la parte difficile. Non c'è modo di aggirarla.
            </p>
            <p className="text-sm text-[#333] leading-relaxed" style={serif}>
              Cosa puoi fare adesso per stare un po' meglio
              <em> nonostante </em>
              la sua presenza?
            </p>
          </div>
          <textarea
            value={commit}
            onChange={e => setCommit(e.target.value)}
            placeholder="anche una cosa piccola — o lascia vuoto"
            rows={3}
            className="w-full bg-transparent border border-[#e0e0e0] rounded-xl p-4 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] resize-none"
          />
          <button onClick={() => setStep('end-accept')}
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
            ok
          </button>
        </div>
      )}

      {/* END C: Acceptance */}
      {step === 'end-accept' && (
        <div className="space-y-8 py-4">
          <div className="space-y-5">
            <p className="text-xl leading-relaxed text-[#1a1a1a]" style={serif}>
              Non risolve il problema.
            </p>
            <p className="text-base leading-relaxed text-[#555]" style={serif}>
              Crea spazio per continuare a funzionare nonostante esso.
              È la versione adulta dell'andare avanti.
            </p>
            {commit && (
              <p className="text-sm text-[#888] px-4 py-3 bg-[#f7f7f5] rounded-lg" style={serif}>
                {commit}
              </p>
            )}
            <p className="text-xs text-[#bbb]" style={mono}>
              — da Mo Gawdat, Solve for Happy
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('home')}
              className="flex-1 py-4 bg-[#1a1a1a] text-white rounded-xl text-sm hover:bg-[#333] transition-colors">
              torna alla home
            </button>
            <button onClick={reset}
              className="py-4 px-5 border border-[#ddd] text-[#888] rounded-xl text-sm hover:bg-[#f5f5f5] transition-colors">
              ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
