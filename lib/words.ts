export type Word = {
  id: string;
  swiss: string;
  standard: string;
  english: string;
  portuguese: string;
  category: string;
};

export const swissGermanWords: Word[] = [
  // Greetings
  { id: "w1", swiss: "Grüezi", standard: "Guten Tag", english: "Good day / Hello", portuguese: "Bom dia / Olá", category: "greetings" },
  { id: "w2", swiss: "Hoi", standard: "Hallo", english: "Hi", portuguese: "Oi", category: "greetings" },
  { id: "w3", swiss: "Sali", standard: "Hallo (informal)", english: "Hey (informal)", portuguese: "Oi (informal)", category: "greetings" },
  { id: "w4", swiss: "Tschüss", standard: "Auf Wiedersehen", english: "Goodbye", portuguese: "Tchau", category: "greetings" },
  { id: "w5", swiss: "Ade", standard: "Auf Wiedersehen", english: "Farewell", portuguese: "Adeus", category: "greetings" },
  { id: "w6", swiss: "Merci", standard: "Danke", english: "Thank you", portuguese: "Obrigado", category: "greetings" },
  { id: "w7", swiss: "Bitte", standard: "Bitte", english: "Please / You're welcome", portuguese: "Por favor / De nada", category: "greetings" },
  { id: "w8", swiss: "Entschuldigung", standard: "Entschuldigung", english: "Excuse me / Sorry", portuguese: "Com licença / Desculpe", category: "greetings" },
  // Numbers
  { id: "w9", swiss: "Eis", standard: "Eins", english: "One", portuguese: "Um", category: "numbers" },
  { id: "w10", swiss: "Zwöi", standard: "Zwei", english: "Two", portuguese: "Dois", category: "numbers" },
  { id: "w11", swiss: "Drüü", standard: "Drei", english: "Three", portuguese: "Três", category: "numbers" },
  { id: "w12", swiss: "Vier", standard: "Vier", english: "Four", portuguese: "Quatro", category: "numbers" },
  { id: "w13", swiss: "Füüf", standard: "Fünf", english: "Five", portuguese: "Cinco", category: "numbers" },
  // Common words
  { id: "w14", swiss: "Rüebli", standard: "Karotte", english: "Carrot", portuguese: "Cenoura", category: "food" },
  { id: "w15", swiss: "Znüni", standard: "Frühstück / Pausenbrot", english: "Mid-morning snack", portuguese: "Lanche da manhã", category: "food" },
  { id: "w16", swiss: "Zmorge", standard: "Frühstück", english: "Breakfast", portuguese: "Café da manhã", category: "food" },
  { id: "w17", swiss: "Zmittag", standard: "Mittagessen", english: "Lunch", portuguese: "Almoço", category: "food" },
  { id: "w18", swiss: "Znacht", standard: "Abendessen", english: "Dinner", portuguese: "Jantar", category: "food" },
  { id: "w19", swiss: "Wasser", standard: "Wasser", english: "Water", portuguese: "Água", category: "food" },
  { id: "w20", swiss: "Chuchichäschtli", standard: "Küchenschrank", english: "Kitchen cupboard", portuguese: "Armário de cozinha", category: "objects" },
  { id: "w21", swiss: "Velo", standard: "Fahrrad", english: "Bicycle", portuguese: "Bicicleta", category: "transport" },
  { id: "w22", swiss: "Tram", standard: "Straßenbahn", english: "Tram", portuguese: "Bonde", category: "transport" },
  { id: "w23", swiss: "Bähnli", standard: "Kleine Bahn", english: "Small train", portuguese: "Trenzinho", category: "transport" },
  { id: "w24", swiss: "Ja", standard: "Ja", english: "Yes", portuguese: "Sim", category: "basics" },
  { id: "w25", swiss: "Nein", standard: "Nein", english: "No", portuguese: "Não", category: "basics" },
  { id: "w26", swiss: "Guet", standard: "Gut", english: "Good", portuguese: "Bom", category: "basics" },
  { id: "w27", swiss: "Schön", standard: "Schön", english: "Beautiful / Nice", portuguese: "Bonito / Legal", category: "basics" },
  { id: "w28", swiss: "Gross", standard: "Groß", english: "Big", portuguese: "Grande", category: "basics" },
  { id: "w29", swiss: "Chli", standard: "Klein", english: "Small", portuguese: "Pequeno", category: "basics" },
  { id: "w30", swiss: "Gummiband", standard: "Gummiband", english: "Rubber band", portuguese: "Elástico", category: "objects" },
];

export function getRandomWords(count: number = 10): Word[] {
  const shuffled = [...swissGermanWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getWrongOptions(correct: Word, all: Word[], count: number = 3): Word[] {
  const others = all.filter((w) => w.id !== correct.id);
  return others.sort(() => Math.random() - 0.5).slice(0, count);
}
