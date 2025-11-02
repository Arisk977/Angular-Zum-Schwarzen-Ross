import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from 'app/interfaces/order.interface';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent {
  @Input() order!: Order;
  @Input() orderId!: string;
    @Input() activeOrderId!: string | null;
  @Output() toggle = new EventEmitter<void>();

    get showDetails(): boolean {
    return this.activeOrderId === this.orderId;
  }

  onToggleDetails() {
    this.toggle.emit();
  }

}
