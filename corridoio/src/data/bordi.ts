export interface BordiCard {
  type: string;
  content: string;
}

export const BORDI_POOL: BordiCard[] = [
  {
    type: 'osservazione fisica',
    content: 'Sei un sistema dissipativo che elabora gradiente entropico. La coscienza è il picco locale di integrazione che questo processo ha generato. Non sei separato dal cosmo — sei uno dei suoi modi di conoscersi.',
  },
  {
    type: 'paradosso',
    content: "Le anomalie iniziali — entropia bassa, asimmetria materia-antimateria — sono le condizioni necessarie per l'esistenza di sistemi capaci di rilevare che sono anomale. L'universo non ha generato la domanda nonostante le sue condizioni. Le ha generate attraverso di esse.",
  },
  {
    type: 'posizione minima',
    content: "Non c'è perché. C'è come. E io sono dentro quel come. Non è nichilismo — è il punto da cui tutto il resto diventa praticabile senza cercare fondamenti che non ci sono.",
  },
  {
    type: 'nagarjuna',
    content: "Nulla ha esistenza intrinseca. Tutto esiste in relazione ad altro — incluso il concetto di relazione. Non c'è un livello sotto le relazioni che le sorregge. Le relazioni sono tutto quello che c'è.",
  },
  {
    type: 'coscienza',
    content: "Il hard problem rimane. Non è una mancanza della scienza — è il bordo preciso dove la descrizione in terza persona finisce e qualcosa d'altro inizia. Quel qualcosa sei tu.",
  },
  {
    type: 'prigogine',
    content: "Le strutture dissipative creano ordine locale aumentando l'entropia globale più velocemente. La vita non viola la seconda legge — la sfrutta. L'ordine non è contro la termodinamica: è la sua conseguenza più efficiente.",
  },
  {
    type: 'domanda',
    content: "Nessuno sa perché le condizioni iniziali dell'universo fossero così ordinate. Potrebbe essere fisica nuova. Potrebbe essere un dato primitivo. La differenza non è epistemica — è temperamentale.",
  },
  {
    type: 'senso come strumento',
    content: "Quando il senso serve, il cervello lo produce. Quando non serve, cade. Non devi crederci sempre. Il senso è un tool, non una verità — e questo non lo svaluta. Lo rende utilizzabile.",
  },
  {
    type: 'rovelli',
    content: "Le relazioni non richiedono un fondamento esterno. L'assoluto, se esiste, non è fuori dal relativo — è la totalità del relativo vista da dentro. La fisica quantistica relazionale lo conferma senza dirlo.",
  },
  {
    type: 'luogo fisico',
    content: "Un posto stabile nella vita adulta è raro. Lo sport di squadra, il bar di quartiere, la parrocchia: non erano luoghi dove succedeva qualcosa di speciale — erano posti dove ci si trovava per abitudine, senza sforzo organizzativo. La socialità era un sottoprodotto. Ricostruirlo richiede intenzionalità, non nostalgia.",
  },
];

export function getRandomBordi(n = 3): BordiCard[] {
  const shuffled = [...BORDI_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
