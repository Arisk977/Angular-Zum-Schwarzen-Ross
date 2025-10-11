import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  @Input() title: string = '';
  @Input() gericht: any;
  @Input() selectedSize: string | null = null;
  @Input() deletedIngredients: string[] = [];
  @Input() addedIngredients: string[] = [];

  @Output() back = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<void>();
}
