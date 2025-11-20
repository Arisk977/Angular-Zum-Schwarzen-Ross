import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from './../shared/services/cart.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CartItem } from 'app/interfaces/cart-item.interface';
import { ButtonComponent } from 'app/shared/component/button/button.component';

@Component({
  selector: 'app-warenkorb',
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  templateUrl: './warenkorb.component.html',
  styleUrl: './warenkorb.component.scss'
})
export class WarenkorbComponent implements OnInit {
  @Input() isOpen = false;
  cartItems$!: Observable<CartItem[]>;

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cart$;

    this.cartItems$.subscribe(items => {
      console.log('🧾 Aktuelle Warenkorb-Daten:', items);
    })
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    this.cartService.stopCartListener();
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  increaseQuantity(item: CartItem) {
    // einfacher Weg: Item nochmal hinzufügen
    this.cartService.addToCart(item);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService['cartSubject'].next(this.cartService.getItems());
      this['cartService']['updateFirestoreCart']();
    }
  }


  removeItem(item: CartItem) {
    const index = this.cartService.getItems().indexOf(item);
    if (index !== -1) this.cartService.removeFromCart(index);
  }

  closeCart() {
    this.isOpen = false;
  }

}
