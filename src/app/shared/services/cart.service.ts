import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, updateDoc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { onSnapshot } from 'firebase/firestore';
import { CartItem } from 'app/interfaces/cart-item.interface';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
    private unsubscribeListener?: () => void;

  constructor(private firestore: Firestore, private auth: Auth) { }

    startCartListener() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);

    // Falls schon ein Listener aktiv ist → beenden
    if (this.unsubscribeListener) this.unsubscribeListener();

    this.unsubscribeListener = onSnapshot(userRef, snapshot => {
      const data = snapshot.data();
      if (data && Array.isArray(data['cart'])) {
        this.items = data['cart'];
      } else {
        this.items = [];
      }
      this.cartSubject.next(this.items);
    });
  }

   stopCartListener() {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = undefined;
    }
  }



  /** 🛒 Hinzufügen */
  async addToCart(item: CartItem) {
    item.zutatenHinzugefuegt = item.zutatenHinzugefuegt || [];
    item.zutatenEntfernt = item.zutatenEntfernt || [];
    // Prüfen, ob identischer Artikel (gleiche Optionen) bereits im Warenkorb ist
    const existing = this.items.find(
      i =>
        i.title === item.title &&
        i.groesse === item.groesse &&
        JSON.stringify(i.zutatenHinzugefuegt) === JSON.stringify(item.zutatenHinzugefuegt) &&
        JSON.stringify(i.zutatenEntfernt) === JSON.stringify(item.zutatenEntfernt) &&
        i.extrawunsch === item.extrawunsch
    );

    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({
        ...item,
        zutatenHinzugefuegt: item.zutatenHinzugefuegt || [],
        zutatenEntfernt: item.zutatenEntfernt || [],
        quantity: item.quantity || 1
      });

    }
    this.cartSubject.next(this.items);

    await this.updateFirestoreCart();
  }

  /** ❌ Entfernen */
  async removeFromCart(index: number) {
    this.items.splice(index, 1);
    this.cartSubject.next(this.items);
    await this.updateFirestoreCart();
  }

  /** 🧹 Leeren */
  async clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);
    await this.updateFirestoreCart();
  }

 /** 📥 Firestore → Lokaler Warenkorb */
async loadCartFromFirestore() {
  const user = this.auth.currentUser;
  if (!user) return;

  const userRef = doc(this.firestore, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data && Array.isArray(data['cart'])) {
      this.items = data['cart'];
    } else {
      this.items = [];
    }
  } else {
    // Falls noch kein Warenkorb-Dokument existiert
    this.items = [];
    await setDoc(userRef, { cart: [] });
  }

  this.cartSubject.next(this.items);
}


  /** 📤 Lokaler Warenkorb → Firestore */
  private async updateFirestoreCart() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, { cart: this.items }).catch(async err => {
      // Falls das Dokument noch nicht existiert
      await setDoc(userRef, { cart: this.items });
    });
  }

  /** 📊 Helper */
  getItems() {
    return this.items;
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.preis * item.quantity, 0);
  }
}
