import { useState, lazy, Suspense } from 'react';
import { useAppState } from './hooks/useAppState';

const Home = lazy(() => import('./components/Home'));
const StageView = lazy(() => import('./components/StageView'));
const KoanView = lazy(() => import('./components/KoanView'));
const Silenzio = lazy(() => import('./components/Silenzio'));

type Screen = 'home' | 'stage' | 'koan' | 'silenzio';

function Spinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: '#0e0c09' }}>
      <div className="w-8 h-8 rounded-full border border-[#c85428] border-t-transparent animate-spin opacity-60" />
    </div>
  );
}

export default function App() {
  const appState = useAppState();
  const [screen, setScreen] = useState<Screen>('home');

  function navigate(s: Screen) {
    setScreen(s);
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ background: '#0e0c09', minHeight: '100dvh' }}>
      <Suspense fallback={<Spinner />}>
        {screen === 'home'     && <Home     appState={appState} navigate={navigate} />}
        {screen === 'stage'    && <StageView appState={appState} navigate={navigate} />}
        {screen === 'koan'     && <KoanView  appState={appState} navigate={navigate} />}
        {screen === 'silenzio' && <Silenzio  appState={appState} navigate={navigate} />}
      </Suspense>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: '#0e0c09',
          borderTop: '1px solid #2a2620',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center">
          {([
            { id: 'home',     label: 'Il percorso', icon: '◯' },
            { id: 'koan',     label: 'Koan',        icon: '無' },
            { id: 'silenzio', label: 'Silenzio',    icon: '—' },
          ] as { id: Screen; label: string; icon: string }[]).map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-200"
              style={{
                color: screen === item.id ? '#c85428' : '#4a4640',
                fontFamily: "'EB Garamond', Georgia, serif",
              }}
              aria-label={item.label}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
