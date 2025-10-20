import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Observable, filter, firstValueFrom } from 'rxjs';
import { CartService } from '../shared/services/cart.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { HeaderComponent } from 'app/shared/component/header/header.component';
import { Order } from 'app/interfaces/order.interface';
import { CartItem } from 'app/interfaces/cart-item.interface';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems$!: Observable<CartItem[]>;
  totalPrice: number = 0;
  deliveryType: 'abholung' | 'lieferung' | null = null;

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

  @ViewChildren(NgModel) formFields!: QueryList<NgModel>;

  constructor(
    private cartService: CartService,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) { }

  ngOnInit(): void {
   this.setupCartSubscription();
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe((e: any) => {
      if (e.urlAfterRedirects === '/checkout') {
        this.setupCartSubscription();
      }
    });

    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        await this.loadUserData(user.uid);
      }
    });
  }

private setupCartSubscription() {
  this.cartItems$ = this.cartService.cart$;
  this.cartService.cart$.subscribe(items => {
    this.totalPrice = items.reduce(
      (acc, item) => acc + (item.preis * item.quantity),
      0
    );
  });
}


  private async loadUserData(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        this.checkoutPersonalData(data);
        if (data['adresse']) {
          const address = data['adresse'] as any;
          this.checkoutAddress(address);
        }
      }
    } catch (err) {
      console.error('❌ Fehler beim Laden der Userdaten:', err);
    }
  }

  checkoutPersonalData(data: any) {
    this.checkoutForm.firstName = data['vorname'] || '';
    this.checkoutForm.lastName = data['nachname'] || '';
    this.checkoutForm.phone = data['telefonnummer'] || '';
  }

  checkoutAddress(address: any) {
    this.checkoutForm.street = address['strasse'] || '';
    this.checkoutForm.houseNumber = address['hausnummer'] || '';
    this.checkoutForm.city = address['ort'] || '';
    this.checkoutForm.zip = address['plz'] || '';
  }

  async finalizeOrder(form: NgForm): Promise<void> {
  if (form.invalid) {
    return;
  }
    const cartItems = await firstValueFrom(this.cartService.cart$);
    const order = this.buildOrder(cartItems);

    await this.saveOrderInFirestore(order);
  }

  private buildOrder(cartItems: CartItem[]): Order {
    const fullAddress = `${this.checkoutForm.street} ${this.checkoutForm.houseNumber}, ${this.checkoutForm.zip} ${this.checkoutForm.city}`;
    const fullName = `${this.checkoutForm.firstName} ${this.checkoutForm.lastName}`;
    const userData = this.auth.currentUser;

    return {
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
  }

  async saveOrderInFirestore(order: any) {
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


