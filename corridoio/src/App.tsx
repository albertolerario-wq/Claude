import { useState, lazy, Suspense } from 'react';
import { useAppState } from './hooks/useAppState';
import Onboarding from './components/Onboarding';
import ModeSelect from './components/ModeSelect';
import type { MomentoEvent } from './types';

// Lazy load all heavy screens
const Home = lazy(() => import('./components/Home'));
const CheckIn = lazy(() => import('./components/CheckIn'));
const LoopProtocol = lazy(() => import('./components/LoopProtocol'));
const Slot = lazy(() => import('./components/Slot'));
const EntropiaModule = lazy(() => import('./components/EntropiaModule'));
const PhiRel = lazy(() => import('./components/PhiRel'));
const Bordi = lazy(() => import('./components/Bordi'));
const InteresseComposto = lazy(() => import('./components/InteresseComposto'));
const ProgettoGruppo = lazy(() => import('./components/ProgettoGruppo'));
const HistoryLog = lazy(() => import('./components/HistoryLog'));
const CosmicDiagram = lazy(() => import('./components/CosmicDiagram'));
const CosmicPosition = lazy(() => import('./components/CosmicPosition'));
const Impermanenza = lazy(() => import('./components/Impermanenza'));
const Flowchart = lazy(() => import('./components/Flowchart'));
const Momento = lazy(() => import('./components/Momento'));

const LAST_OPEN_KEY = 'corridoio_lastopen';
const INTERVAL_MS = 30 * 60 * 1000;

function checkShouldShowMomento(firstRun: boolean): boolean {
  const now = Date.now();
  const last = localStorage.getItem(LAST_OPEN_KEY);
  localStorage.setItem(LAST_OPEN_KEY, String(now));
  if (firstRun || !last) return false;
  return now - Number(last) >= INTERVAL_MS;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
      <div className="w-6 h-6 rounded-full border-2 border-[#e8622a] border-t-transparent animate-spin" />
    </div>
  );
}

export type NavProps = {
  navigate: (s: string) => void;
  appState: ReturnType<typeof useAppState>;
};

export default function App() {
  const appState = useAppState();
  const { state, setMode, saveMomento } = appState;
  const [screen, setScreen] = useState<string>(() => {
    if (state.settings.firstRun) return 'onboarding';
    return 'home';
  });
  const [loopOpen, setLoopOpen] = useState(false);
  const [showMomento, setShowMomento] = useState(() =>
    checkShouldShowMomento(state.settings.firstRun)
  );

  function navigate(s: string) {
    setScreen(s);
    window.scrollTo(0, 0);
  }

  if (screen === 'onboarding') {
    return <Onboarding onDone={() => navigate('mode-select')} />;
  }

  if (screen === 'mode-select') {
    return (
      <ModeSelect
        onSelect={(mode, nickname, groupName) => {
          setMode(mode, nickname, groupName);
          navigate('home');
        }}
      />
    );
  }

  const navProps: NavProps = { navigate, appState };

  return (
    <div className={`min-h-screen bg-[#f7f6f2] ${state.settings.darkMode ? 'dark' : ''}`}>
      <Suspense fallback={<LoadingFallback />}>
        {screen === 'home' && <Home {...navProps} onOpenLoop={() => setLoopOpen(true)} />}
        {screen === 'checkin' && <CheckIn {...navProps} />}
        {screen === 'slot' && <Slot {...navProps} />}
        {screen === 'entropia' && <EntropiaModule {...navProps} />}
        {screen === 'phi' && <PhiRel {...navProps} />}
        {screen === 'bordi' && <Bordi {...navProps} />}
        {screen === 'interesse' && <InteresseComposto {...navProps} />}
        {screen === 'progetto' && <ProgettoGruppo {...navProps} />}
        {screen === 'history' && <HistoryLog {...navProps} />}
        {screen === 'cosmic' && <CosmicDiagram onClose={() => navigate('home')} />}
        {screen === 'cosmic-position' && (
          <CosmicPosition onClose={() => navigate('home')} />
        )}
        {screen === 'impermanenza' && (
          <Impermanenza {...navProps} onOpenCosmic={() => navigate('cosmic-position')} />
        )}
        {screen === 'flowchart' && <Flowchart {...navProps} />}
      </Suspense>

      {/* Bottom nav */}
      {screen !== 'onboarding' && screen !== 'mode-select' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e8e8]"
          style={{ boxShadow: '0 -1px 8px rgba(0,0,0,0.06)' }}>
          <div className="max-w-lg mx-auto flex items-center">
            {[
              { id: 'home',      label: 'Home',       icon: '⌂'  },
              { id: 'checkin',   label: 'Check-in',   icon: '+'  },
              { id: 'flowchart', label: 'Difficoltà', icon: '?'  },
              { id: 'history',   label: 'Storia',     icon: '≡'  },
            ].map(item => (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-150 ${
                  screen === item.id
                    ? 'text-[#e8622a]'
                    : 'text-[#aaa] hover:text-[#666]'
                }`}
                aria-label={item.label}>
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-[0.6rem]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Loop FAB — sits above nav */}
      {!loopOpen && screen !== 'onboarding' && screen !== 'mode-select' && (
        <button
          onClick={() => setLoopOpen(true)}
          className="fixed bottom-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#7d2d3a] text-white rounded-full text-sm font-medium shadow-lg hover:bg-[#6d1f2a] transition-colors duration-200"
          aria-label="Apri protocollo loop"
        >
          <span>⚡</span>
          <span>loop</span>
        </button>
      )}

      {/* Loop overlay */}
      {loopOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <LoopProtocol appState={appState} onClose={() => setLoopOpen(false)} />
        </Suspense>
      )}

      {/* Momento overlay */}
      {showMomento && (
        <Suspense fallback={null}>
          <Momento
            onSave={(reason) => {
              const event: MomentoEvent = {
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toTimeString().slice(0, 5),
                reason,
              };
              saveMomento(event);
            }}
            onDismiss={() => setShowMomento(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
