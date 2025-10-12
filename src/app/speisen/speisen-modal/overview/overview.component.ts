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


  @Output() back = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<void>();
    @Output() goToDelete = new EventEmitter<void>();
  @Output() goToAdd = new EventEmitter<void>();  

  basePrice: number = 0;
  extraPrice: number = 0;
  totalPrice: number = 0;
  extrawunsch: string = ''; 

  zutatenPreise: { [key: string]: number } = {
    'Hähnchen': 1.5,
    'Salami': 1.0,
    'Peperoni': 0.5,
    'Käse extra': 1.0
  };

  ngOnInit(): void {
    if (this.title === 'Pizzen' && !this.selectedSize) {
      this.selectedSize = '30cm';
    }

    this.updatePrice();
  }

  selectSize(size: string) {
    this.selectedSize = size;
    this.updatePrice();
  }

  updatePrice() {
    const base = this.selectedSize
      ? this.gericht?.preis?.[this.selectedSize] || 0
      : this.gericht?.preis || 0;

    const extras = this.addedIngredients.reduce((sum, ing) => {
      const preis = this.zutatenPreise[ing] || 0;
      return sum + preis;
    }, 0);

    this.basePrice = base;
    this.extraPrice = extras;
    this.totalPrice = base + extras;
  }

  onAddToCart() {
    this.addToCart.emit();
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
