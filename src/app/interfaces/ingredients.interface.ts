export interface IngredientsJson {
  zutaten: Record<string, number>;
  [size: string]: Record<string, number>;  // z. B. "40cm"
}
