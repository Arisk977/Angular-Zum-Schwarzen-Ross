import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-warenkorb',
  imports: [CommonModule, RouterModule],
  templateUrl: './warenkorb.component.html',
  styleUrl: './warenkorb.component.scss'
})

export class WarenkorbComponent {
    @Input() isOpen = false;

  cartItems = [
    { name: 'Pizza Margherita', description: 'Klassisch mit Tomate & Käse', price: 8.5, quantity: 1 },
  ];

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  increaseQuantity(i: number) {
    this.cartItems[i].quantity++;
  }

  decreaseQuantity(i: number) {
    if (this.cartItems[i].quantity > 1) this.cartItems[i].quantity--;
  }

  removeItem(i: number) {
    this.cartItems.splice(i, 1);
  }
  
  closeCart() { this.isOpen = false; }

  checkout() {
    alert('Zur Kasse - Funktion folgt 🔜');
  }
}