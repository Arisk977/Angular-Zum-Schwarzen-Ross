import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/component/header/header.component';
import { OrderItemComponent } from './order-item/order-item.component';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Order } from 'app/interfaces/order.interface'; // dein bestehendes Interface

type OrderWithId = Order & { id: string };

@Component({
  selector: 'app-bestellungen',
  standalone: true,
  imports: [CommonModule, HeaderComponent, OrderItemComponent],
  templateUrl: './bestellungen.component.html',
  styleUrls: ['./bestellungen.component.scss']
})
export class BestellungenComponent implements OnInit {
  orders$?: Observable<OrderWithId[]>;
  user: User | null = null;
  activeOrderId: string | null = null;


  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.user = null;
        this.orders$ = undefined;
        return;
      }

      this.user = user;
      const ref = collection(this.firestore, `users/${user.uid}/orders`);
      this.orders$ = collectionData(ref, { idField: 'id' }) as Observable<OrderWithId[]>;
    });
  }

   setActiveOrder(id: string) {
  this.activeOrderId = this.activeOrderId === id ? null : id;
}
}
