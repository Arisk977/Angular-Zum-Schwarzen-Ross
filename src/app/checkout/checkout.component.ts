import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { CartItem, CartService } from '../shared/services/cart.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { HeaderComponent } from 'app/shared/component/header/header.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  // 🛒 Warenkorb
  cartItems$!: Observable<CartItem[]>;
  totalPrice: number = 0;

  // 🚚 Lieferoption
  deliveryType: 'abholung' | 'lieferung' | null = null;

  // 📋 Formularfelder
  checkoutForm = {
    firstName: '',
    lastName: '',
    phone: '',
    pickupTime: '',
    deliveryTime: '',
    city: '',
    zip: '',
    street: '',
    houseNumber: ''
  };

  // 👉 Alle ngModel Felder referenzieren (für visuelle Validierung)
  @ViewChildren(NgModel) formFields!: QueryList<NgModel>;

  constructor(
    private cartService: CartService,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cart$;
    this.cartService.cart$.subscribe(items => {
      this.totalPrice = items.reduce((acc, item) => acc + (item.preis || 0), 0);
    });
     onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        await this.loadUserData(user.uid);
      }
    });
  }

private async loadUserData(uid: string): Promise<void> {
  try {
    const userRef = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      // 🧍 Personendaten
      this.checkoutForm.firstName = data['vorname'] || '';
      this.checkoutForm.lastName = data['nachname'] || '';
      this.checkoutForm.phone = data['telefonnummer'] || '';

      // 🏡 Adressdaten (verschachtelt)
      if (data['adresse']) {
        const adresse = data['adresse'] as any;
        this.checkoutForm.street = adresse['strasse'] || '';
        this.checkoutForm.houseNumber = adresse['hausnummer'] || '';
        this.checkoutForm.city = adresse['ort'] || '';
        this.checkoutForm.zip = adresse['plz'] || '';
      }
    }
  } catch (err) {
    console.error('❌ Fehler beim Laden der Userdaten:', err);
  }
}


  async finalizeOrder(): Promise<void> {
    // 🔸 Alle Felder als "benutzt" markieren, um Fehler visuell anzuzeigen
    this.formFields.forEach(field => field.control.markAsTouched());

    const fullAddress = `${this.checkoutForm.street} ${this.checkoutForm.houseNumber}, ${this.checkoutForm.zip} ${this.checkoutForm.city}`;
    const fullName = `${this.checkoutForm.firstName} ${this.checkoutForm.lastName}`;
    const userData = this.auth.currentUser;
    const cartItems = await firstValueFrom(this.cartService.cart$);

    // 🧭 Validierung
    if (!this.deliveryType) {
      return;
    }

    if (
      !this.checkoutForm.firstName.trim() ||
      !this.checkoutForm.lastName.trim() ||
      !this.checkoutForm.phone.trim()
    ) {
      return;
    }

    if (
      this.deliveryType === 'lieferung' &&
      (!this.checkoutForm.city.trim() ||
        !this.checkoutForm.zip.trim() ||
        !this.checkoutForm.street.trim() ||
        !this.checkoutForm.houseNumber.trim())
    ) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      return;
    }

    const order = {
      userId: userData?.uid || null,
      name: fullName,
      phone: this.checkoutForm.phone,
      address: this.deliveryType === 'lieferung' ? fullAddress : null,
      abholung: this.deliveryType === 'abholung',
      lieferung: this.deliveryType === 'lieferung',
      uhrzeit:
        this.deliveryType === 'abholung'
          ? this.checkoutForm.pickupTime || null
          : this.checkoutForm.deliveryTime || null,
      items: cartItems,
      total: this.totalPrice,
      timestamp: new Date().toISOString(),
      status: 'offen'
    };

    try {
      // 🔥 Bestellung in Firestore speichern
      const orderId = Date.now().toString();
      const orderRef = doc(this.firestore, 'orders', orderId);
      await setDoc(orderRef, order);

      // 🧹 Warenkorb leeren
      this.cartService.clearCart();

      alert('✅ Bestellung erfolgreich übermittelt!');
      console.log('📄 Order:', order);
    } catch (err) {
      console.error('❌ Fehler beim Speichern der Bestellung:', err);
      alert('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  }
}
