import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/component/header/header.component';
import { OrderItemComponent } from './order-item/order-item.component';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { OrderDetails } from 'app/interfaces/order-details.interface';

@Component({
  selector: 'app-bestellungen',
  standalone: true,
  imports: [CommonModule, HeaderComponent, OrderItemComponent],
  templateUrl: './bestellungen.component.html',
  styleUrls: ['./bestellungen.component.scss']
})
export class BestellungenComponent implements OnInit {
  orders$?: Observable<OrderDetails[]>;
  hasOrders = false;
  user: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.user = null;
        this.orders$ = undefined;
        this.hasOrders = false;
        return;
      }

      this.user = user;
      const ordersRef = collection(this.firestore, `users/${user.uid}/orders`);
      this.orders$ = collectionData(ordersRef, { idField: 'id' }) as Observable<OrderDetails[]>;

      this.orders$.subscribe((orders) => {
        this.hasOrders = orders.length > 0;
      });
    });
  }
}
