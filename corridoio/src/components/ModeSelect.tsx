import { useState } from 'react';

interface Props {
  onSelect: (mode: 'solo' | 'gruppo', nickname: string, groupName: string) => void;
}

export default function ModeSelect({ onSelect }: Props) {
  const [mode, setMode] = useState<'solo' | 'gruppo' | null>(null);
  const [nickname, setNickname] = useState('');
  const [groupName, setGroupName] = useState('');

  function handleConfirm() {
    if (!mode) return;
    if (mode === 'gruppo' && !nickname.trim()) return;
    onSelect(mode, nickname.trim(), groupName.trim());
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f7f6f2]">
      <div className="w-full max-w-md">
        <h1
          className="text-2xl mb-2 text-[#1a1a1a]"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", fontWeight: 500 }}
        >
          Come vuoi usarlo?
        </h1>
        <p className="text-sm text-[#666] mb-8 leading-relaxed">
          Puoi cambiare questa scelta in qualsiasi momento nelle impostazioni.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* SOLO */}
          <button
            onClick={() => setMode('solo')}
            className={`p-5 rounded-lg border-2 text-left transition-all duration-200 ${
              mode === 'solo'
                ? 'border-[#e8622a] bg-[#fff7f4]'
                : 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
            }`}
            aria-pressed={mode === 'solo'}
          >
            <div className="text-lg font-medium text-[#1a1a1a] mb-1">Solo</div>
            <div className="text-xs text-[#888] leading-relaxed">
              Uso individuale. Tutti i dati restano nel browser.
            </div>
          </button>

          {/* GRUPPO */}
          <button
            onClick={() => setMode('gruppo')}
            className={`p-5 rounded-lg border-2 text-left transition-all duration-200 ${
              mode === 'gruppo'
                ? 'border-[#3d5a80] bg-[#f0f4f8]'
                : 'border-[#e5e5e5] bg-white hover:border-[#ccc]'
            }`}
            aria-pressed={mode === 'gruppo'}
          >
            <div className="text-lg font-medium text-[#1a1a1a] mb-1">Gruppo</div>
            <div className="text-xs text-[#888] leading-relaxed">
              Condivisione via JSON. Nessun server.
            </div>
          </button>
        </div>

        {/* Gruppo fields */}
        {mode === 'gruppo' && (
          <div className="space-y-3 mb-6">
            <div>
              <label htmlFor="nickname" className="block text-xs text-[#666] mb-1.5">
                Il tuo soprannome nel gruppo
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="es. Marco"
                className="w-full px-4 py-3 rounded-lg border border-[#ddd] bg-white text-[#1a1a1a] text-sm focus:outline-none focus:border-[#3d5a80]"
                maxLength={20}
                autoCapitalize="words"
              />
            </div>
            <div>
              <label htmlFor="groupname" className="block text-xs text-[#666] mb-1.5">
                Nome del gruppo (opzionale)
              </label>
              <input
                id="groupname"
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="es. Gruppo Milano"
                className="w-full px-4 py-3 rounded-lg border border-[#ddd] bg-white text-[#1a1a1a] text-sm focus:outline-none focus:border-[#3d5a80]"
                maxLength={40}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!mode || (mode === 'gruppo' && !nickname.trim())}
          className="w-full py-3 px-6 bg-[#1a1a1a] text-white rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          Conferma
        </button>
      </div>
    </div>
  );
}
