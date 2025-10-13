import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, updateDoc, arrayUnion, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface CartItem {
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private firestore: Firestore, private auth: Auth) {}

  /** 🛒 Lokales + Firestore Hinzufügen */
  async addToCart(item: CartItem) {
    const existing = this.items.find(i => i.name === item.name);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
    this.cartSubject.next(this.items);

    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userRef, {
        cart: arrayUnion(item)
      });
    }
  }

  /** ❌ Entfernen */
  async removeFromCart(name: string) {
    this.items = this.items.filter(i => i.name !== name);
    this.cartSubject.next(this.items);

    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      if (data && data['cart']) {
        const newCart = data['cart'].filter((i: CartItem) => i.name !== name);
        await updateDoc(userRef, { cart: newCart });
      }
    }
  }

  /** 🧹 Leeren */
  async clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);

    const user = this.auth.currentUser;
    if (user) {
      const userRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userRef, { cart: [] });
    }
  }

  /** 📥 Firestore → Lokaler Warenkorb */
  async loadCartFromFirestore() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    const data = snapshot.data();

    if (data && data['cart']) {
      this.items = data['cart'];
      this.cartSubject.next(this.items);
    }
  }

  /** 📊 Hilfsfunktionen */
  getItems() {
    return this.items;
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
