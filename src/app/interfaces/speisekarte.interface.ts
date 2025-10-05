export interface Gericht {
  nummer: number;
  name: string;
  beschreibung: string;
  preis: number;
}

export interface Speisekarte {
  [kategorie: string]: Gericht[];
}
