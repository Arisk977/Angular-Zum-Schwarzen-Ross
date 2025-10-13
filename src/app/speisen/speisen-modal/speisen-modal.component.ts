import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeisenGruppeComponent } from './speisen-gruppe/speisen-gruppe.component';
import { Speisekarte, Gericht } from '../../interfaces/speisekarte.interface';
import { DeleteIngredientsComponent } from './delete-ingredients/delete-ingredients.component';
import { FormsModule } from '@angular/forms';
import { AddIngredientsComponent } from './add-ingredients/add-ingredients.component';
import { OverviewComponent } from './overview/overview.component';
import ingredientsDataJson from './../../../assets/json/ingredients.json';
import { IngredientsJson } from './../../interfaces/ingredients.interface';

@Component({
  selector: 'app-speisen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SpeisenGruppeComponent, DeleteIngredientsComponent, AddIngredientsComponent, OverviewComponent],
  templateUrl: './speisen-modal.component.html',
  styleUrl: './speisen-modal.component.scss'
})
export class SpeisenModalComponent {
  @Input() title: string = '';
  @Input() gerichte: Gericht[] = [];
  @Input() kategorien: string[] = [];
  @Input() currentIndex: number = 0;
  @Input() speisen: Speisekarte = {};

  isDeleteIngredientsActive = false;
  isAddIngredientsActive = false;
  isOverviewActive = false;
  priceChanged = false;

  selectedDish: any = null;
  selectedSize: string | null = null;
  deletedIngredients: string[] = [];
  addedIngredients: string[] = [];
  basePrice: number = 0;
  finalPrice: number = 0;
  extrawunsch: string = '';


  @ViewChild(AddIngredientsComponent) addIngredientsComp?: AddIngredientsComponent;
  @ViewChild(DeleteIngredientsComponent) deleteIngredientsComp?: DeleteIngredientsComponent;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) { }

openDishOverview(dish: Gericht) {
  this.selectedDish = dish;
  const price = dish.preis;

  const hasSizeOptions =
    typeof price === 'object' &&
    price !== null &&
    ('30cm' in price || '40cm' in price);

  if (hasSizeOptions) {
    this.selectedSize = '30cm';
    this.basePrice = price['30cm'];
    this.finalPrice = this.basePrice;
  } else {
    this.basePrice = price as number;
    this.finalPrice = this.basePrice;
  }

  this.isOverviewActive = true;
  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = false;
}




selectSizeAndContinue() {
  if (this.selectedSize) {
    const preis = this.selectedDish.preis[this.selectedSize];
    this.basePrice = preis;
    this.finalPrice = this.basePrice;
    this.isDeleteIngredientsActive = true;
  }
}


  backToList() {
    this.isDeleteIngredientsActive = false;
    this.selectedSize = null;
    this.selectedDish = null;
  }

  triggerSubmitFromFooter() {
  this.deleteIngredientsComp?.submitSelection();
  this.openOverview();
}

  handleDeleteIngredientDelete(event: { gericht: Gericht; entfernteZutaten: string[] }) {
    this.deletedIngredients = event.entfernteZutaten;
    this.calculateFinalPrice(); // 💰 Preis nach Änderung berechnen

    const excludedCategories = ['Vorspeisen', 'Dessert & Extras', 'Getränke'];
    const canAddIngredients = !excludedCategories.includes(this.title);

    if (canAddIngredients) {
      this.openAddIngredients();
    } else {
      this.openOverview();
    }
  }

  close() {
    this.activeModal.close();
  }

  groupByUnterkategorie(gerichte: any[]): {
    unterKategorie: string | null; gerichte: any[]
  }[] {

  const gruppen: Record<string, any[]> = {};

  for (const g of gerichte) {
    const key = g.unterKategorie || '';
    if (!gruppen[key]) gruppen[key] = [];
    gruppen[key].push(g);
  }

  return Object.entries(gruppen).map(([unterKategorie, gerichte]) => ({
    unterKategorie: unterKategorie || null,
    gerichte
  }));
}

navigate(direction: 'prev' | 'next') {
  if (direction === 'prev' && this.currentIndex > 0) {
    this.currentIndex--;
  } else if (direction === 'next' && this.currentIndex < this.kategorien.length - 1) {
    this.currentIndex++;
  } else {
    return;
  }

  const nextTitle = this.kategorien[this.currentIndex];
  const kategorie = this.speisen[nextTitle];

  this.title = nextTitle;
  this.gerichte = [];

  if (Array.isArray(kategorie)) {
    this.gerichte = kategorie;
  } else if (typeof kategorie === 'object' && kategorie !== null) {
    for (const [unterKategorie, gerichte] of Object.entries(
      kategorie as Record<string, Gericht[]>
    )) {
      this.gerichte.push(...gerichte.map(g => ({ ...g, unterKategorie })));
    }
  }
}
openAddIngredients() {
  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = true;
  this.isOverviewActive = false;
}

  handleAddIngredients(selectedExtras: string[]) {
    this.addedIngredients = selectedExtras;
    this.calculateFinalPrice();
    this.openOverview();
  }

triggerAddIngredientsSubmit() {
  this.addIngredientsComp?.submitSelection();
  this.openOverview();
}


openOverview() {
  if (this.finalPrice === 0 && this.selectedDish?.preis) {
    if (typeof this.selectedDish.preis === 'number') {
      this.basePrice = this.selectedDish.preis;
    } else if (this.selectedSize) {
      this.basePrice = this.selectedDish.preis[this.selectedSize];
    }
    this.finalPrice = this.basePrice;
  }

  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = false;
  this.isOverviewActive = true;
}



finalizeOrder(event?: { extrawunsch: string }) {
  if (event && event.extrawunsch) {
    this.extrawunsch = event.extrawunsch;
  }

  const order = {
    gerichtNummer: this.selectedDish.nummer,
    title: this.selectedDish.name,
    basisZutaten: this.selectedDish.zutaten || [],
    zutatenEntfernt: this.deletedIngredients,
    zutatenHinzugefügt: this.addedIngredients,
    groesse: this.selectedSize,
    preis: this.finalPrice,
    extrawunsch: this.extrawunsch
  };

  console.log('🛒 Bestellung:', order);
  this.close();
}

private normalizeIngredients() {
  this.deletedIngredients = this.deletedIngredients.map(z => this.capitalizeFirstLetter(z));
  this.addedIngredients = this.addedIngredients.map(z => this.capitalizeFirstLetter(z));
}

private capitalizeFirstLetter(text: string): string {
  const trimmed = text.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}


calculateExtraPrice(): number {
  this.normalizeIngredients();
  return this.addedIngredients.reduce(
    (sum, ing) => sum + this.getIngredientPriceBySize(ing),
    0
  );

}

onSizeChanged(size: string) {
  this.selectedSize = size;
  this.basePrice = this.selectedDish?.preis?.[size] || this.basePrice;
  this.calculateFinalPrice();
}

private getIngredientPriceBySize(ingredient: string): number {
  const ingredientsData = ingredientsDataJson as any;
  const normalizedSize = this.selectedSize?.replace(/\s/g, '') || '';
  const normalizedIng = this.capitalizeFirstLetter(ingredient.trim());

  if (ingredientsData[normalizedSize] && ingredientsData[normalizedSize][normalizedIng] !== undefined) {
    return ingredientsData[normalizedSize][normalizedIng];
  }

  return ingredientsData.zutaten[normalizedIng] || 0;
}


calculateFinalPrice() {
  this.normalizeIngredients();
  let price = this.basePrice;

  // 🟢 Zutaten hinzufügen
  this.addedIngredients.forEach(ing => {
    price += this.getIngredientPriceBySize(ing);
  });

  // 🔁 Zutaten ersetzen → nur Differenz berechnen
  if (this.deletedIngredients.length && this.addedIngredients.length) {
    const minCount = Math.min(this.deletedIngredients.length, this.addedIngredients.length);

    for (let i = 0; i < minCount; i++) {
      const removed = this.deletedIngredients[i];
      const added = this.addedIngredients[i];

      const removedPrice = this.getIngredientPriceBySize(removed);
      const addedPrice = this.getIngredientPriceBySize(added);

      if (addedPrice > removedPrice) {
        price += (addedPrice - removedPrice);
      }
    }
  }

  this.finalPrice = price;
  this.priceChanged = true;
  setTimeout(() => (this.priceChanged = false), 150);
}



liveDeleteUpdate(removed: string[]) {
  this.deletedIngredients = removed.map(z => this.capitalizeFirstLetter(z));
  this.calculateFinalPrice();
}

liveAddUpdate(added: string[]) {
  this.addedIngredients = added.map(z => this.capitalizeFirstLetter(z));
  this.calculateFinalPrice();
}



goToDeleteIngredients() {
  this.isOverviewActive = false;
  this.isDeleteIngredientsActive = true;
  this.isAddIngredientsActive = false;
}

goToAddIngredients() {
  this.isOverviewActive = false;
  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = true;
}

}
