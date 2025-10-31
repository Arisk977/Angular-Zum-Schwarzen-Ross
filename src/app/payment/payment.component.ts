import { AfterViewInit, Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { OrderService } from 'app/shared/services/order.service';
import { CartService } from 'app/shared/services/cart.service';
import { Order } from 'app/interfaces/order.interface';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'app/shared/component/header/header.component';

declare var paypal: any;

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit {
  order: Order | null = null;
  paymentMethod: string = '';

  constructor(
    private orderService: OrderService,
    private firestore: Firestore,
    private cartService: CartService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.order = this.orderService.getPendingOrder();
    if (!this.order) {
      alert('Keine Bestellung gefunden. Bitte erneut versuchen.');
      this.router.navigate(['/checkout']);
    }
  }

  ngAfterViewInit() {
    if (this.paymentMethod === 'paypal' || this.paymentMethod === 'karte') {
      setTimeout(() => this.renderPayPalButton(), 0);
    }
  }


  onPaymentChange() {
    if (this.paymentMethod === 'paypal' || this.paymentMethod === 'karte') {
      setTimeout(() => this.renderPayPalButton(), 100);
    } else {
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';
    }
  }

renderPayPalButton() {
  setTimeout(() => {
    // 🔹 Existierenden Container komplett entfernen
    const oldContainer = document.getElementById('paypal-button-container');
    if (oldContainer) {
      oldContainer.remove();
    }

    const wrapper = document.querySelector('.paypal-zone-wrapper');
    const newContainer = document.createElement('div');
    newContainer.id = 'paypal-button-container';
    newContainer.className = 'paypal-zone';
    wrapper?.appendChild(newContainer);

    // 🔹 Prüfen, ob SDK geladen
    if (typeof paypal === 'undefined') {
      console.warn('⚠️ PayPal SDK noch nicht geladen.');
      return;
    }

    const fundingSource =
      this.paymentMethod === 'karte'
        ? paypal.FUNDING.CARD
        : paypal.FUNDING.PAYPAL;

    paypal
      .Buttons({
        fundingSource,
        style: {
          layout: 'vertical',
          color: this.paymentMethod === 'karte' ? 'black' : 'gold',
          shape: 'pill',
          label: this.paymentMethod === 'karte' ? 'pay' : 'paypal'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: this.order!.total.toFixed(2) },
                description: `Bestellung ${this.order!.name}`
              }
            ]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          console.log(`✅ ${this.paymentMethod} bestätigt:`, details);
          await this.confirmPaymentSuccess(this.paymentMethod);
        },
        onError: (err: any) => {
          console.error(`❌ Fehler bei ${this.paymentMethod}:`, err);
          alert('Zahlung fehlgeschlagen. Bitte erneut versuchen.');
        }
      })
      .render('#paypal-button-container');
  }, 150);
}




  async confirmPaymentSuccess(method: string) {
    if (!this.order) return;

    try {
      const orderId = Date.now().toString();
      const orderRef = doc(this.firestore, 'orders', orderId);

      await setDoc(orderRef, {
        ...this.order,
        paymentMethod: method,
        status: 'bezahlt',
        timestamp: new Date().toISOString()
      });

      this.cartService.clearCart();
      this.orderService.clearPendingOrder();

      setTimeout(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/payment/order-success'], {
            state: { orderId }
          });
        });
      }, 500);
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      alert('Fehler beim Abschluss. Bitte erneut versuchen.');
    }
  }
}
