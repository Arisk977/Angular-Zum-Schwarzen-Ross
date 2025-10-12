import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gericht } from '../../../interfaces/speisekarte.interface';

@Component({
  selector: 'app-delete-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-ingredients.component.html',
  styleUrl: './delete-ingredients.component.scss'
})
export class DeleteIngredientsComponent {
  @Input() gericht!: Gericht;
  @Output() selectionSubmitted = new EventEmitter<{ gericht: Gericht; entfernteZutaten: string[] }>();
  @Output() back = new EventEmitter<void>();
  @Output() selectionChanged = new EventEmitter<string[]>();

  selectedIngredients: string[] = [];
  
  toggleIngredient(ingredient: string) {
    const index = this.selectedIngredients.indexOf(ingredient);
    if (index > -1) {
      this.selectedIngredients.splice(index, 1);
    } else {
      this.selectedIngredients.push(ingredient);
    }
    
  this.selectionChanged.emit(this.selectedIngredients);
  }

  isSelected(ingredient: string): boolean {
    return this.selectedIngredients.includes(ingredient);
  }

  submitSelection() {
    this.selectionSubmitted.emit({
      gericht: this.gericht,
      entfernteZutaten: this.selectedIngredients
    });
  }

  resetSelection() {
    this.selectedIngredients = [];
  }
}