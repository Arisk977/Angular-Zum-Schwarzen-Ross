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
import { CartService } from './../../shared/services/cart.service';


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
  deletedIngredients: { zutaten: string[]; salat: string[] } = { zutaten: [], salat: [] };
  addedIngredients: { zutaten: string[]; salat: string[] } = { zutaten: [], salat: [] };
  basePrice: number = 0;
  finalPrice: number = 0;
  extrawunsch: string = '';

  @ViewChild(OverviewComponent) overview!: OverviewComponent;
  @ViewChild(AddIngredientsComponent) addIngredientsComp?: AddIngredientsComponent;
  @ViewChild(DeleteIngredientsComponent) deleteIngredientsComp?: DeleteIngredientsComponent;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private cartService: CartService
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

  triggerSubmitFromFooter() {
    this.deleteIngredientsComp?.submitSelection();
    this.openOverview();
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

  private substitutions: Record<string, string> = {
    'Putenfleisch': 'Schweinefleisch',
    'Schweinefleisch': 'Putenfleisch'
  };

  private handleDeleteSubstitutions() {
    Object.entries(this.substitutions).forEach(([added, removed]) => {
      if (this.deletedIngredients.zutaten.includes(removed)) {
        if (!this.addedIngredients.zutaten.includes(added)) {
          this.addedIngredients.zutaten.push(added);
        }
      }
      else {
        const index = this.addedIngredients.zutaten.indexOf(added);
        if (index !== -1) {
          this.addedIngredients.zutaten.splice(index, 1);
        }
      }
    });
  }

  private handleAddSubstitutions() {
    Object.entries(this.substitutions).forEach(([added, removed]) => {
      if (this.addedIngredients.zutaten.includes(added)) {
        if (!this.deletedIngredients.zutaten.includes(removed)) {
          this.deletedIngredients.zutaten.push(removed);
        }
      } else {
        const index = this.deletedIngredients.zutaten.indexOf(removed);
        if (index !== -1) {
          this.deletedIngredients.zutaten.splice(index, 1);
        }
      }
    });
  }

  private saladSubstitutions: Record<string, string> = {
    'Joghurtsoße': 'Senfsoße',
    'Essig Öl': 'Senfsoße',
    'Balsamico': 'Senfsoße'
  };

  private handleSaladAddSubstitutions() {
    Object.entries(this.saladSubstitutions).forEach(([added, removed]) => {
      const normalizedAdded = added.toLowerCase();
      const normalizedSalat = this.addedIngredients.salat.map(s => s.toLowerCase());

      if (normalizedSalat.includes(normalizedAdded)) {
        if (!this.deletedIngredients.salat.includes(removed)) {
          this.deletedIngredients.salat.push(removed);
        }
      } else {
        const stillHasOtherSauce = Object.keys(this.saladSubstitutions).some(other =>
          normalizedSalat.includes(other.toLowerCase())
        );

        if (!stillHasOtherSauce) {
          const index = this.deletedIngredients.salat.indexOf(removed);
          if (index !== -1) {
            this.deletedIngredients.salat.splice(index, 1);
          }
        }
      }
    });
  }

  handleDeleteIngredientDelete(event: {
    gericht: Gericht;
    entfernte: { zutaten: string[]; salat: string[] };
  }) {
    this.deletedIngredients = {
      zutaten: event.entfernte.zutaten.map(z => this.capitalizeFirstLetter(z)),
      salat: event.entfernte.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.handleDeleteSubstitutions();
    this.calculateFinalPrice();
    this.openOverview();
  }

  handleAddIngredients(added: { zutaten: string[]; salat: string[] }) {
    this.addedIngredients = {
      zutaten: added.zutaten.map(e => this.capitalizeFirstLetter(e)),
      salat: added.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.handleSaladAddSubstitutions()
    this.handleAddSubstitutions();
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

  private normalizeIngredients() {
    this.deletedIngredients = {
      zutaten: this.deletedIngredients.zutaten.map(z => this.capitalizeFirstLetter(z)),
      salat: this.deletedIngredients.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.addedIngredients = {
      zutaten: this.addedIngredients.zutaten.map(e => this.capitalizeFirstLetter(e)),
      salat: this.addedIngredients.salat.map(s => this.capitalizeFirstLetter(s))
    };
  }

  calculateExtraPrice(): number {
    this.normalizeIngredients();
    return this.calcExtra();
  }

  private calcExtra(): number {
    const allRemoved = [...this.deletedIngredients.zutaten, ...this.deletedIngredients.salat];
    const allAdded = [...this.addedIngredients.zutaten, ...this.addedIngredients.salat];
    const removedTotal = allRemoved
      .map(i => this.priceOf(i))
      .reduce((sum, price) => sum + price, 0);

    const addedTotal = allAdded
      .map(i => this.priceOf(i))
      .reduce((sum, price) => sum + price, 0);

    let diffCents = Math.round((addedTotal - removedTotal) * 100);
    if (diffCents < 0) diffCents = 0;

    return diffCents / 100;
  }

  onSizeChanged(size: string) {
    this.selectedSize = size;
    this.basePrice = this.selectedDish?.preis?.[size] || this.basePrice;
    this.calculateFinalPrice();
  }

  isFamilyPizza(ingredientsData: any, normalizedSize: any, normalizedIng: any) {
    return ingredientsData[normalizedSize] && ingredientsData[normalizedSize][normalizedIng] !== undefined
  }

  private getIngredientPriceBySize(ingredient: string): number {
    const ingredientsData = ingredientsDataJson as any;
    const normalizedSize = this.selectedSize?.replace(/\s/g, '') || '';
    const normalizedIng = this.capitalizeFirstLetter(ingredient.trim());

    if (this.isFamilyPizza(ingredientsData, normalizedSize, normalizedIng)) {
      return ingredientsData[normalizedSize][normalizedIng];
    }
    else {
      return ingredientsData.zutaten[normalizedIng] || 0;
    }
  }


  private priceOf(ing: string): number {
    return Number(this.getIngredientPriceBySize(ing)) || 0;
  }

  calculateFinalPrice() {
    this.normalizeIngredients();

    const base = this.basePrice || 0;
    const delta = this.calcExtra();

    const final = base + delta;
    this.finalPrice = Math.round(final * 100) / 100;

    this.priceChanged = true;
    setTimeout(() => (this.priceChanged = false), 150);
  }

  liveDeleteUpdate(removed: { zutaten: string[]; salat: string[] }) {
    this.deletedIngredients = {
      zutaten: removed.zutaten.map(z => this.capitalizeFirstLetter(z)),
      salat: removed.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.handleDeleteSubstitutions();
    this.calculateFinalPrice();
  }

  liveAddUpdate(added: { zutaten: string[]; salat: string[] }) {
    this.addedIngredients = {
      zutaten: added.zutaten.map(e => this.capitalizeFirstLetter(e)),
      salat: added.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.handleSaladAddSubstitutions()
    this.handleAddSubstitutions();
    this.calculateFinalPrice();
  }

  private capitalizeFirstLetter(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }


  goToDeleteIngredients() {
    this.isOverviewActive = false;
    this.isDeleteIngredientsActive = true;
    this.isAddIngredientsActive = false;

    if (this.deleteIngredientsComp) {
      this.deleteIngredientsComp.preselected = {
        zutaten: [...this.deletedIngredients.zutaten],
        salat: [...this.deletedIngredients.salat]
      };
    }
  }

  goToAddIngredients() {
    this.isOverviewActive = false;
    this.isDeleteIngredientsActive = false;
    this.isAddIngredientsActive = true;

    if (this.addIngredientsComp) {
      this.addIngredientsComp.preselectedExtras = {
        zutaten: [...this.addedIngredients.zutaten],
        salat: [...this.addedIngredients.salat]
      };
    }
  }

  finalizeOrder() {
    const extrawunsch = this.overview.extrawunsch;

    const zutatenEntferntFlat = [
      ...this.deletedIngredients.zutaten,
      ...this.deletedIngredients.salat.map(s => `Salat ohne ${s}`)
    ];

    const zutatenHinzugefuegtFlat = [
      ...this.addedIngredients.zutaten,
      ...this.addedIngredients.salat.map(s => `Salat mit ${s}`)
    ];

    const order = {
      gerichtNummer: this.selectedDish.nummer,
      title: this.selectedDish.name,
      beschreibung: this.selectedDish.beschreibung,
      zutatenEntfernt: zutatenEntferntFlat,
      zutatenHinzugefuegt: zutatenHinzugefuegtFlat,
      groesse: this.selectedSize,
      preis: this.finalPrice,
      extrawunsch: extrawunsch,
      timestamp: new Date()
    };

    this.addToCart(order);
  }


  private async addToCart(order: any) {
    await this.cartService.addToCart(order);
    this.close();
  }
}
