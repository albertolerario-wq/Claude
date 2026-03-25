import { useState } from 'react';
import type { useAppState } from '../hooks/useAppState';
import { LOOP_STEPS, LOOP_FOOTER } from '../data/protocol';
import BreathGuide from './BreathGuide';

interface Props {
  appState: ReturnType<typeof useAppState>;
  onClose: () => void;
}

export default function LoopProtocol({ appState, onClose }: Props) {
  const { incrementLoop } = appState;
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [selectedFallback, setSelectedFallback] = useState<string | null>(null);

  function handleOpen() {
    incrementLoop();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center sm:items-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: '1.5px solid #e8b4a0' }}
        role="dialog"
        aria-modal="true"
        aria-label="Protocollo loop"
      >
        {/* Top handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#ddd] rounded-full" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-[#7d2d3a]">Protocollo Loop</h2>
              <p className="text-xs text-[#aaa] mt-0.5">attivazione fisiologica + loop cognitivo</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#888] hover:text-[#333] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200"
              aria-label="Chiudi protocollo"
            >
              ✕
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-2" role="list">
            {LOOP_STEPS.map((step, idx) => {
              const isOpen = activeStep === idx;
              return (
                <div
                  key={step.number}
                  className="rounded-lg border border-[#f0f0f0] overflow-hidden"
                  role="listitem"
                >
                  <button
                    onClick={() => {
                      setActiveStep(isOpen ? null : idx);
                      if (idx === 0) handleOpen();
                    }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#fafafa] transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <span className="w-6 h-6 rounded-full bg-[#fde8e8] text-[#7d2d3a] text-xs font-medium flex items-center justify-center flex-shrink-0">
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1a1a1a]">{step.title}</div>
                      <div className="text-xs text-[#888] mt-0.5 leading-snug">{step.instruction}</div>
                    </div>
                    <span className="text-[#ccc] text-sm">{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 bg-[#fafafa]">
                      {step.detail && (
                        <p className="text-sm text-[#666] leading-relaxed mb-3"
                           style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {step.detail}
                        </p>
                      )}

                      {/* Breath guide for step 2 */}
                      {step.isBreath && (
                        <BreathGuide />
                      )}

                      {/* Fallback options for step 4 */}
                      {step.options && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {step.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setSelectedFallback(opt)}
                              className={`py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
                                selectedFallback === opt
                                  ? 'bg-[#3d5a80] text-white'
                                  : 'bg-white border border-[#e5e5e5] text-[#555] hover:border-[#3d5a80]'
                              }`}
                              aria-pressed={selectedFallback === opt}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-[#f0f0f0]">
            <p
              className="text-sm text-[#888] leading-relaxed text-center"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {LOOP_FOOTER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
