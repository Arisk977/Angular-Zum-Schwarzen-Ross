import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  @Input() title: string = '';
  @Input() gericht: any;
  @Input() selectedSize: string | null = null;
  @Input() deletedIngredients: string[] = [];
  @Input() addedIngredients: string[] = [];
  @Input() finalPrice: number = 0;
  @Input() basePrice: number = 0;
  @Input() extraPrice: number = 0;
  @Input() totalPrice: number = 0;



  @Output() back = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{ extrawunsch: string }>();
  @Output() sizeChanged = new EventEmitter<string>();
  @Output() goToDelete = new EventEmitter<void>();
  @Output() goToAdd = new EventEmitter<void>();

  extrawunsch: string = '';

  ngOnInit(): void {
    if (this.title === 'Pizzen' && !this.selectedSize) {
      this.selectedSize = '30cm';
    }
  }

  selectSize(size: string) {
    this.sizeChanged.emit(size);
  }
  onAddToCart() {
    this.addToCart.emit({
      extrawunsch: this.extrawunsch
    });
  }


  onBack() {
    this.back.emit();
  }

  onGoToDelete() {
    this.goToDelete.emit();
  }

  onGoToAdd() {
    this.goToAdd.emit();
  }


}
