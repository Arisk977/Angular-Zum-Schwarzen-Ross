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
  @Input() preselected: { zutaten: string[], salat: string[] } = { zutaten: [], salat: [] };

  @Output() selectionSubmitted = new EventEmitter<{
  gericht: Gericht;
  entfernte: { zutaten: string[]; salat: string[] };}>();
  @Output() back = new EventEmitter<void>();
  @Output() selectionChanged = new EventEmitter<{ zutaten: string[]; salat: string[] }>();


  salatExtras: string[] = ['Grüner Salat', 'Karotten', 'Weißkraut', 'Tomaten', 'Gurken', 'Senfsoße'];
  selectedSalatExtras: string[] = [];
  selectedIngredients: string[] = [];
  
ngOnInit() {
  if (this.preselected) {
    this.selectedIngredients = [...this.preselected.zutaten];
    this.selectedSalatExtras = [...this.preselected.salat];
  }
}

ngOnChanges() {
  if (this.preselected) {
    this.selectedIngredients = [...this.preselected.zutaten];
    this.selectedSalatExtras = [...this.preselected.salat];
  }
}



toggleIngredient(ingredient: string) {
  const index = this.selectedIngredients.indexOf(ingredient);
  if (index > -1) {
    this.selectedIngredients.splice(index, 1);
  } else {
    this.selectedIngredients.push(ingredient);

    if (ingredient === 'Salat') {
      this.selectedSalatExtras = [];
    }
  }

  this.emitSelection();
}

toggleSalatExtra(extra: string) {
  const index = this.selectedSalatExtras.indexOf(extra);
  if (index > -1) {
    this.selectedSalatExtras.splice(index, 1);
  } else {
    this.selectedSalatExtras.push(extra);
  }

  this.emitSelection();
}

private emitSelection() {
  const selectionObject = {
    zutaten: [...this.selectedIngredients],
    salat: [...this.selectedSalatExtras]
  };

  this.selectionChanged.emit(selectionObject);
}



  isSelected(ingredient: string): boolean {
    return this.selectedIngredients.includes(ingredient);
  }

    isSalatExtraSelected(extra: string): boolean {
    return this.selectedSalatExtras.includes(extra);
  }

submitSelection() {
  this.selectionSubmitted.emit({
    gericht: this.gericht,
    entfernte: {
      zutaten: [...this.selectedIngredients],
      salat: [...this.selectedSalatExtras]
    }
  });
}


  resetSelection() {
    this.selectedIngredients = [];
  }

    shouldShowSalatExtras(): boolean {
    const hasSalat = this.gericht?.zutaten?.includes('Salat');
    const salatSelected = this.selectedIngredients.includes('Salat');
    return !!hasSalat && !salatSelected;
  }
}