import { useState } from 'react';

interface Props {
  onDone: () => void;
}

const SLIDES = [
  {
    title: 'Corridoio',
    body: 'Uno strumento di osservazione, non di ottimizzazione. Monitora dove sei nel sistema, non quanto sei bravo.',
    sub: 'La felicità non è uno stato da massimizzare. È una condizione sistemica da mantenere in un range.',
  },
  {
    title: 'Come funziona',
    body: 'Ogni giorno, 4 parametri in 60 secondi. Il grafico mostra la tua posizione tra dissoluzione e sovraccarico.',
    sub: 'La zona arancio al centro è dove il pensiero funziona meglio. La posizione cambia. Il sistema si osserva.',
  },
  {
    title: 'I dati',
    body: 'I dati restano nel tuo browser. Nessun account, nessun server, nessuna notifica.',
    sub: 'In modalità gruppo puoi condividere un JSON giornaliero con i tuoi contatti. Solo quello.',
  },
];

export default function Onboarding({ onDone }: Props) {
  const [slide, setSlide] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f7f6f2]">
      <div className="w-full max-w-md">
        {/* Slide content */}
        <div className="mb-10">
          <h1
            className="text-3xl mb-4 text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "'EB Garamond', Georgia, serif", fontWeight: 500 }}
          >
            {SLIDES[slide].title}
          </h1>
          <p className="text-lg text-[#1a1a1a] mb-3 leading-relaxed">
            {SLIDES[slide].body}
          </p>
          <p className="text-sm text-[#666] leading-relaxed">
            {SLIDES[slide].sub}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === slide ? 'w-6 bg-[#e8622a]' : 'w-1.5 bg-[#ccc]'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              className="flex-1 py-3 px-6 border border-[#ddd] rounded-lg text-[#666] text-sm"
              aria-label="Slide precedente"
            >
              Indietro
            </button>
          )}
          <button
            onClick={() => slide < SLIDES.length - 1 ? setSlide(s => s + 1) : onDone()}
            className="flex-1 py-3 px-6 bg-[#e8622a] text-white rounded-lg text-sm font-medium"
            aria-label={slide < SLIDES.length - 1 ? 'Slide successiva' : 'Continua'}
          >
            {slide < SLIDES.length - 1 ? 'Avanti' : 'Inizia'}
          </button>
        </div>
      </div>
    </div>
  );
}
