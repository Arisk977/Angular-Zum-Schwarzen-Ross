import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeisenGruppeComponent } from './speisen-gruppe/speisen-gruppe.component';
import { Speisekarte, Gericht } from '../../interfaces/speisekarte.interface';
import { DeleteIngredientsComponent } from './delete-ingredients/delete-ingredients.component';
import { FormsModule } from '@angular/forms';
import { AddIngredientsComponent } from './add-ingredients/add-ingredients.component';
import { OverviewComponent } from './overview/overview.component';

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

  selectedDish: any = null;
  selectedSize: string | null = null;
  deletedIngredients: string[] = [];
  addedIngredients: string[] = [];

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
      this.isSizeSelectionActive = true;
      this.isDeleteIngredientsActive = false;
    } else {
      this.isDeleteIngredientsActive = true;
      this.isSizeSelectionActive = false;
    }
  }


  selectSizeAndContinue() {
    if (this.selectedSize) {
      console.log('✅ Gewählte Größe:', this.selectedSize);
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
    console.log('🧾 Gericht:', event.gericht);
    console.log('🥩 Entfernte Zutaten:', event.entfernteZutaten);
    const excludedCategories = [
      'Vorspeisen',
      'Dessert & Extras',
      'Getränke'
    ];
    const canAddIngredients = !excludedCategories.includes(this.title);
    
    this.deletedIngredients = event.entfernteZutaten;
    if (canAddIngredients) {
      this.openAddIngredients();
    } else {
      this.openOverview();
    }

  }



  close() {
    this.activeModal.close();
  }

  groupByUnterkategorie(
    gerichte: any[]
  ): { unterKategorie: string | null; gerichte: any[] }[] {
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
    this.openOverview();
  }

  triggerAddIngredientsSubmit() {
    this.addIngredientsComp?.submitSelection();
  }


  openOverview() {
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
      ...this.selectedDish,
      size: this.selectedSize,
      removed: this.deletedIngredients,
      added: this.addedIngredients
    };
    console.log('🛒 Bestellung:', order);
    this.close();
  }

}
