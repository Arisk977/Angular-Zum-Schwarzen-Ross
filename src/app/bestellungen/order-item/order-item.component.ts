import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-item',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.scss'
})
export class OrderItemComponent {
  @Input() orderNumber!: string;
  @Input() total!: number;
  @Input() date!: string;
  @Input() status!: string;
}
