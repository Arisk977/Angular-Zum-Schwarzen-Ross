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

  isSizeSelectionActive = false;
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


  @ViewChild(AddIngredientsComponent) addIngredientsComp?: AddIngredientsComponent;
  @ViewChild(DeleteIngredientsComponent) deleteIngredientsComp?: DeleteIngredientsComponent;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) { }

openDeleteIngredients(dish: Gericht) {
  this.selectedDish = dish;
  const price = dish.preis;

  const hasSizeOptions =
    typeof price === 'object' &&
    price !== null &&
    ('30cm' in price || '40cm' in price);

  if (hasSizeOptions) {
    // 👉 Preis wird erst nach Größenauswahl gesetzt
    this.isSizeSelectionActive = true;
    this.isDeleteIngredientsActive = false;
  } else {
    // 👉 Gericht ohne Größen — Basispreis direkt setzen
    this.basePrice = price as number;
    this.finalPrice = this.basePrice;
    this.isDeleteIngredientsActive = true;
    this.isSizeSelectionActive = false;
  }
}



selectSizeAndContinue() {
  if (this.selectedSize) {
    const preis = this.selectedDish.preis[this.selectedSize];
    this.basePrice = preis;
    this.finalPrice = this.basePrice;
    this.isSizeSelectionActive = false;
    this.isDeleteIngredientsActive = true;
  }
}


  backToList() {
    this.isDeleteIngredientsActive = false;
    this.isSizeSelectionActive = false;
    this.selectedSize = null;
    this.selectedDish = null;
  }

  triggerSubmitFromFooter() {
    this.deleteIngredientsComp?.submitSelection();
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
  this.isSizeSelectionActive = false;
  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = true;
  this.isOverviewActive = false;
}

  handleAddIngredients(selectedExtras: string[]) {
    this.addedIngredients = selectedExtras;
    this.calculateFinalPrice(); // 💰 Preis neu berechnen
    this.openOverview();
  }

triggerAddIngredientsSubmit() {
  this.addIngredientsComp?.submitSelection();
}


openOverview() {
  // 🧮 falls finalPrice noch nicht gesetzt wurde
  if (this.finalPrice === 0 && this.selectedDish?.preis) {
    if (typeof this.selectedDish.preis === 'number') {
      this.basePrice = this.selectedDish.preis;
    } else if (this.selectedSize) {
      this.basePrice = this.selectedDish.preis[this.selectedSize];
    }
    this.finalPrice = this.basePrice;
  }

  this.isSizeSelectionActive = false;
  this.isDeleteIngredientsActive = false;
  this.isAddIngredientsActive = false;
  this.isOverviewActive = true;
}


backToDelete() {
  this.isAddIngredientsActive = false;
  this.isDeleteIngredientsActive = true;
}

backToAddIngredients() {
  this.isOverviewActive = false;
  this.isAddIngredientsActive = true;
}

  finalizeOrder() {
    const order = {
      gerichtNummer: this.selectedDish.nummer,
      title: this.selectedDish.name,
      basisZutaten: this.selectedDish.zutaten || [],
      zutatenEntfernt: this.deletedIngredients,
      zutatenHinzugefügt: this.addedIngredients,
      groesse: this.selectedSize,
      preis: this.finalPrice
    };

    console.log('🛒 Bestellung:', order);
    this.close();
  }

  getIngredientPrice(ingredient: string): number {
    const ingredientsData = ingredientsDataJson as IngredientsJson;
    const sizeKey = this.selectedSize === '40 cm' ? '40cm' : null;
    const sizePrices = sizeKey ? ingredientsData[sizeKey] || {} : {};
    
    return sizePrices[ingredient] ?? ingredientsData.zutaten[ingredient] ?? 0;
  }

calculateFinalPrice() {
  let price = this.basePrice;

  this.addedIngredients.forEach(ing => {
    const isInBase = this.selectedDish.zutaten?.includes(ing);
    const isSwapping =
      this.deletedIngredients.length > 0 &&
      this.deletedIngredients.length === this.addedIngredients.length;

    if (isInBase) return;
    if (isSwapping) return;

    price += this.getIngredientPrice(ing);
  });

  this.finalPrice = price;

  // ✨ Animations-Trigger
  this.priceChanged = true;
  setTimeout(() => (this.priceChanged = false), 150);
}


liveDeleteUpdate(removed: string[]) {
  this.deletedIngredients = removed;
  this.calculateFinalPrice();
}

liveAddUpdate(added: string[]) {
  this.addedIngredients = added;
  this.calculateFinalPrice();
}

}
