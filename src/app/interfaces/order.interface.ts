import { CartItem } from "./cart-item.interface";

export interface Order {
  userId: string | null;
  name: string;
  phone: string;
  address: string | null;
  abholung: boolean;
  lieferung: boolean;
  uhrzeit: string | null;
  items: CartItem[];
  total: number;
  timestamp: string;
  status: string;
}
