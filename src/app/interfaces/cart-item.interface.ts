export interface CartItem {
  id?: string;
  gerichtNummer?: number;
  title: string;
  groesse?: string;
  basisZutaten: string[];
  zutatenEntfernt: string[];
  zutatenHinzugefuegt: string[];
  preis: number;
  extrawunsch?: string;
  quantity: number;
}
