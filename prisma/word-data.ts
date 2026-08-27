// The word-base source of truth: Swiss German (gsw) prompts with their
// correct meaning in every supported target language. Seeded into the
// `WordBase` table (see prisma/seed.ts) instead of shipping as one giant
// client-side JSON/array — new target languages or words only require new
// rows, never a schema or code change.
export type WordEntry = {
  swiss: string;
  category: string;
  meaning: { en: string; pt: string; de: string };
};

export const WORD_ENTRIES: WordEntry[] = [
  // Greetings
  { swiss: "Grüezi", category: "greetings", meaning: { en: "Good day / Hello", pt: "Bom dia / Olá", de: "Guten Tag" } },
  { swiss: "Hoi", category: "greetings", meaning: { en: "Hi", pt: "Oi", de: "Hallo" } },
  { swiss: "Sali", category: "greetings", meaning: { en: "Hey (informal)", pt: "Oi (informal)", de: "Hallo (informell)" } },
  { swiss: "Tschüss", category: "greetings", meaning: { en: "Goodbye", pt: "Tchau", de: "Auf Wiedersehen" } },
  { swiss: "Ade", category: "greetings", meaning: { en: "Farewell", pt: "Adeus", de: "Auf Wiedersehen" } },
  { swiss: "Merci", category: "greetings", meaning: { en: "Thank you", pt: "Obrigado", de: "Danke" } },
  { swiss: "Merci vilmal", category: "greetings", meaning: { en: "Thank you very much", pt: "Muito obrigado", de: "Vielen Dank" } },
  { swiss: "Bitte", category: "greetings", meaning: { en: "Please / You're welcome", pt: "Por favor / De nada", de: "Bitte" } },
  { swiss: "Entschuldigung", category: "greetings", meaning: { en: "Excuse me / Sorry", pt: "Com licença / Desculpe", de: "Entschuldigung" } },
  { swiss: "Grüessech", category: "greetings", meaning: { en: "Hello (formal, Bernese)", pt: "Olá (formal, bernês)", de: "Guten Tag (formell, Berndeutsch)" } },
  { swiss: "Bis spöter", category: "greetings", meaning: { en: "See you later", pt: "Até mais tarde", de: "Bis später" } },
  { swiss: "Guet Nacht", category: "greetings", meaning: { en: "Good night", pt: "Boa noite", de: "Gute Nacht" } },
  // Numbers
  { swiss: "Eis", category: "numbers", meaning: { en: "One", pt: "Um", de: "Eins" } },
  { swiss: "Zwöi", category: "numbers", meaning: { en: "Two", pt: "Dois", de: "Zwei" } },
  { swiss: "Drüü", category: "numbers", meaning: { en: "Three", pt: "Três", de: "Drei" } },
  { swiss: "Vier", category: "numbers", meaning: { en: "Four", pt: "Quatro", de: "Vier" } },
  { swiss: "Füüf", category: "numbers", meaning: { en: "Five", pt: "Cinco", de: "Fünf" } },
  { swiss: "Sächs", category: "numbers", meaning: { en: "Six", pt: "Seis", de: "Sechs" } },
  { swiss: "Sibe", category: "numbers", meaning: { en: "Seven", pt: "Sete", de: "Sieben" } },
  { swiss: "Acht", category: "numbers", meaning: { en: "Eight", pt: "Oito", de: "Acht" } },
  { swiss: "Nün", category: "numbers", meaning: { en: "Nine", pt: "Nove", de: "Neun" } },
  { swiss: "Zäh", category: "numbers", meaning: { en: "Ten", pt: "Dez", de: "Zehn" } },
  // Food
  { swiss: "Rüebli", category: "food", meaning: { en: "Carrot", pt: "Cenoura", de: "Karotte" } },
  { swiss: "Znüni", category: "food", meaning: { en: "Mid-morning snack", pt: "Lanche da manhã", de: "Znüni (Vormittagssnack)" } },
  { swiss: "Zmorge", category: "food", meaning: { en: "Breakfast", pt: "Café da manhã", de: "Frühstück" } },
  { swiss: "Zmittag", category: "food", meaning: { en: "Lunch", pt: "Almoço", de: "Mittagessen" } },
  { swiss: "Znacht", category: "food", meaning: { en: "Dinner", pt: "Jantar", de: "Abendessen" } },
  { swiss: "Vieri", category: "food", meaning: { en: "Afternoon snack", pt: "Lanche da tarde", de: "Vieri (Nachmittagssnack)" } },
  { swiss: "Wasser", category: "food", meaning: { en: "Water", pt: "Água", de: "Wasser" } },
  { swiss: "Herdöpfel", category: "food", meaning: { en: "Potato", pt: "Batata", de: "Kartoffel" } },
  { swiss: "Öpfel", category: "food", meaning: { en: "Apple", pt: "Maçã", de: "Apfel" } },
  { swiss: "Brot", category: "food", meaning: { en: "Bread", pt: "Pão", de: "Brot" } },
  { swiss: "Chäs", category: "food", meaning: { en: "Cheese", pt: "Queijo", de: "Käse" } },
  { swiss: "Rahm", category: "food", meaning: { en: "Cream", pt: "Creme de leite", de: "Rahm (Sahne)" } },
  { swiss: "Güetzi", category: "food", meaning: { en: "Cookie", pt: "Biscoito", de: "Keks" } },
  { swiss: "Röschti", category: "food", meaning: { en: "Fried grated potato dish", pt: "Prato de batata ralada frita", de: "Rösti" } },
  // Objects / home
  { swiss: "Chuchichäschtli", category: "objects", meaning: { en: "Kitchen cupboard", pt: "Armário de cozinha", de: "Küchenschrank" } },
  { swiss: "Gummiband", category: "objects", meaning: { en: "Rubber band", pt: "Elástico", de: "Gummiband" } },
  { swiss: "Sagex", category: "objects", meaning: { en: "Styrofoam", pt: "Isopor", de: "Styropor" } },
  { swiss: "Natel", category: "objects", meaning: { en: "Mobile phone", pt: "Celular", de: "Handy" } },
  { swiss: "Portemonnaie", category: "objects", meaning: { en: "Wallet", pt: "Carteira", de: "Geldbeutel" } },
  { swiss: "Kuchichäschtli-Schlüssel", category: "objects", meaning: { en: "Kitchen cupboard key", pt: "Chave do armário de cozinha", de: "Küchenschrankschlüssel" } },
  // Transport
  { swiss: "Velo", category: "transport", meaning: { en: "Bicycle", pt: "Bicicleta", de: "Fahrrad" } },
  { swiss: "Tram", category: "transport", meaning: { en: "Tram", pt: "Bonde", de: "Straßenbahn" } },
  { swiss: "Bähnli", category: "transport", meaning: { en: "Small train", pt: "Trenzinho", de: "Kleine Bahn" } },
  { swiss: "Töffli", category: "transport", meaning: { en: "Moped", pt: "Ciclomotor", de: "Moped" } },
  { swiss: "Car", category: "transport", meaning: { en: "Coach bus", pt: "Ônibus de turismo", de: "Reisebus" } },
  // Basics / adjectives
  { swiss: "Ja", category: "basics", meaning: { en: "Yes", pt: "Sim", de: "Ja" } },
  { swiss: "Nein", category: "basics", meaning: { en: "No", pt: "Não", de: "Nein" } },
  { swiss: "Guet", category: "basics", meaning: { en: "Good", pt: "Bom", de: "Gut" } },
  { swiss: "Schön", category: "basics", meaning: { en: "Beautiful / Nice", pt: "Bonito / Legal", de: "Schön" } },
  { swiss: "Gross", category: "basics", meaning: { en: "Big", pt: "Grande", de: "Groß" } },
  { swiss: "Chli", category: "basics", meaning: { en: "Small", pt: "Pequeno", de: "Klein" } },
  { swiss: "Guet Rüef", category: "basics", meaning: { en: "Good call / good idea", pt: "Boa ideia", de: "Guter Vorschlag" } },
  { swiss: "Fein", category: "basics", meaning: { en: "Tasty / nice", pt: "Gostoso / bom", de: "Fein" } },
  { swiss: "Gspässig", category: "basics", meaning: { en: "Funny / strange", pt: "Engraçado / estranho", de: "Komisch" } },
  { swiss: "Herzig", category: "basics", meaning: { en: "Cute", pt: "Fofo", de: "Herzig (niedlich)" } },
  { swiss: "Gäll", category: "basics", meaning: { en: "Right? (tag question)", pt: "Né? (interjeição)", de: "Nicht wahr?" } },
  { swiss: "Genau", category: "basics", meaning: { en: "Exactly", pt: "Exatamente", de: "Genau" } },
  { swiss: "Chlar", category: "basics", meaning: { en: "Sure / of course", pt: "Claro", de: "Klar" } },
  { swiss: "Öppis", category: "basics", meaning: { en: "Something", pt: "Alguma coisa", de: "Etwas" } },
  { swiss: "Nüt", category: "basics", meaning: { en: "Nothing", pt: "Nada", de: "Nichts" } },
  { swiss: "Hüt", category: "time", meaning: { en: "Today", pt: "Hoje", de: "Heute" } },
  { swiss: "Moorn", category: "time", meaning: { en: "Tomorrow", pt: "Amanhã", de: "Morgen" } },
  { swiss: "Geschter", category: "time", meaning: { en: "Yesterday", pt: "Ontem", de: "Gestern" } },
  { swiss: "Jetz", category: "time", meaning: { en: "Now", pt: "Agora", de: "Jetzt" } },
  { swiss: "Spöter", category: "time", meaning: { en: "Later", pt: "Mais tarde", de: "Später" } },
  // People / family
  { swiss: "Chind", category: "family", meaning: { en: "Child", pt: "Criança", de: "Kind" } },
  { swiss: "Mueter", category: "family", meaning: { en: "Mother", pt: "Mãe", de: "Mutter" } },
  { swiss: "Vater", category: "family", meaning: { en: "Father", pt: "Pai", de: "Vater" } },
  { swiss: "Fründ", category: "family", meaning: { en: "Friend", pt: "Amigo", de: "Freund" } },
  { swiss: "Chleini Schwöschter", category: "family", meaning: { en: "Little sister", pt: "Irmã pequena", de: "Kleine Schwester" } },
  // Weather / nature
  { swiss: "Sunne", category: "nature", meaning: { en: "Sun", pt: "Sol", de: "Sonne" } },
  { swiss: "Rägen", category: "nature", meaning: { en: "Rain", pt: "Chuva", de: "Regen" } },
  { swiss: "Schnee", category: "nature", meaning: { en: "Snow", pt: "Neve", de: "Schnee" } },
  { swiss: "Bärg", category: "nature", meaning: { en: "Mountain", pt: "Montanha", de: "Berg" } },
  { swiss: "See", category: "nature", meaning: { en: "Lake", pt: "Lago", de: "See" } },
];
