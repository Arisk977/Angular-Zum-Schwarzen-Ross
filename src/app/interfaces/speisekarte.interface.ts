export interface Gericht {
  nummer: number;
  name: string;
  beschreibung: string;
  preis: number;
  zutaten?: string[];
  unterKategorie?: string;
}

export interface Speisekarte {
  [kategorie: string]: Gericht[];
}
