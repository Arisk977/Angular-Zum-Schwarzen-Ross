import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order } from 'app/interfaces/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private pendingOrder = new BehaviorSubject<Order | null>(null);
  pendingOrder$ = this.pendingOrder.asObservable();

  setPendingOrder(order: Order) {
    this.pendingOrder.next(order);
  }

  getPendingOrder(): Order | null {
    return this.pendingOrder.value;
  }

  clearPendingOrder() {
    this.pendingOrder.next(null);
  }
}
