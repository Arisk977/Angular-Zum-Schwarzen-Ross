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
  originalIngredients: { zutaten: string[]; salat: string[] } = { zutaten: [], salat: [] };
  basePrice: number = 0;
  finalPrice: number = 0;
  extrawunsch: string = '';
  disabledAddSauces: string[] = [];
  private substitutions: Record<string, string> = {
    'Putenfleisch': 'Schweinefleisch',
    'Schweinefleisch': 'Putenfleisch'
  };
  private sideSubstitutions: Record<string, string> = {};
  private sideOptions = ['Reis', 'Pommes', 'Kroketten', 'Bratkartoffel', 'Folienkartoffeln', 'Salzkartoffeln'];
  private sauceOptions = ['Senfsoße', 'Joghurtsoße', 'Essig Öl', 'Balsamico'];
  private readonly BASE_SAUCE = 'Senfsoße';


  @ViewChild(OverviewComponent) overview!: OverviewComponent;
  @ViewChild(AddIngredientsComponent) addIngredientsComp?: AddIngredientsComponent;
  @ViewChild(DeleteIngredientsComponent) deleteIngredientsComp?: DeleteIngredientsComponent;

  constructor(
    public activeModal: NgbActiveModal,
    private cartService: CartService
  ) { }

  openDishOverview(dish: Gericht) {
    this.selectedDish = dish;
    const price = dish.preis;
    this.originalIngredients = {
      zutaten: dish.zutaten ? [...dish.zutaten] : [],
      salat: []
    };

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

  private applyGenericSubstitution(
    activeAdded: string[],
    deletedTarget: string[],
    substitutions: Record<string, string>
  ) {
    Object.entries(substitutions).forEach(([added, removed]) => {
      if (activeAdded.includes(added)) {
        if (!deletedTarget.includes(removed)) {
          deletedTarget.push(removed);
        }
      } else {
        const stillHasOther = Object.entries(substitutions).some(
          ([otherAdded, otherRemoved]) =>
            otherRemoved === removed && activeAdded.includes(otherAdded)
        );

        if (!stillHasOther) {
          const index = deletedTarget.indexOf(removed);
          if (index !== -1) {
            deletedTarget.splice(index, 1);
          }
        }
      }
    });
  }

  private getSideOption(): string | null {
    if (!this.originalIngredients || !this.originalIngredients.zutaten) return null;
    return this.originalIngredients.zutaten.find(z => this.sideOptions.includes(z)) || null;
  }

  private addSideSubstitutions() {
    const originalSide = this.getSideOption();
    if (!originalSide) return;

    this.sideSubstitutions = {};

    this.sideOptions.forEach(side => {
      if (side !== originalSide) {
        this.sideSubstitutions[side] = originalSide;
      }
    });
  }

  private handleDeleteSubstitutions() {
    const originalSide = this.getSideOption();
    if (originalSide && !this.deletedIngredients.zutaten.includes(originalSide)) {
      this.addedIngredients.zutaten = this.addedIngredients.zutaten.filter(
        z => !this.sideOptions.includes(z)
      );
    }

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
    this.addSideSubstitutions();
    const activeAdded = this.addedIngredients.zutaten;
    this.handleSideAddSubstitutions(activeAdded);
    this.applyGenericSubstitution(activeAdded, this.deletedIngredients.zutaten, this.substitutions);
  }

  private handleSideAddSubstitutions(activeAdded: string[]) {
    this.applyGenericSubstitution(activeAdded, this.deletedIngredients.zutaten, this.sideSubstitutions);
  }

  private saladSubstitutions: Record<string, string> = {
    'Joghurtsoße': 'Senfsoße',
    'Essig Öl': 'Senfsoße',
    'Balsamico': 'Senfsoße'
  };

  private handleSaladAddSubstitutions() {
    const activeAdded = this.addedIngredients.salat.map(s => this.capitalizeFirstLetter(s));
    this.applyGenericSubstitution(activeAdded, this.deletedIngredients.salat, this.saladSubstitutions);
  }

  private handleSaladDeleteSubstitutions() {
    if (!this.deletedIngredients.salat.includes(this.BASE_SAUCE)) {
      this.addedIngredients.salat = this.addedIngredients.salat.filter(
        s => !this.sauceOptions.includes(s) || s === this.BASE_SAUCE
      );
    }
  }


  private getCurrentMainSaladSauce(): string | null {
  for (const zutat of this.deletedIngredients.zutaten) {
    const normalized = this.capitalizeFirstLetter(zutat);
    if (this.sauceOptions.includes(normalized)) {
      return normalized;
    }
  }
  return null;
}

private handleMainSaladAddSubstitutions(addedSalad: string[]) {
  const normalizedAdded = addedSalad
    .map(s => this.capitalizeFirstLetter(s))
    .filter(s => this.sauceOptions.includes(s));

  const currentMain = this.getCurrentMainSaladSauce();

  if (normalizedAdded.length > 0) {
    const selectedSauce = normalizedAdded[0];
    if (currentMain && !this.deletedIngredients.zutaten.includes(currentMain)) {
      this.deletedIngredients.zutaten.push(currentMain);
    }
    this.addedIngredients.zutaten = [selectedSauce];
    this.disabledAddSauces = this.sauceOptions.filter(s => s !== selectedSauce);

  } else {
    this.addedIngredients.zutaten = this.addedIngredients.zutaten
      .filter(s => !this.sauceOptions.includes(s));

    this.disabledAddSauces = [];
  }

  this.addedIngredients.zutaten = Array.from(new Set(this.addedIngredients.zutaten));
}

private handleMainSaladDeleteSubstitutions() {
  const currentMain = this.getCurrentMainSaladSauce();
  if (!currentMain) {
    this.addedIngredients.zutaten = this.addedIngredients.zutaten.filter(
      zutat => !this.sauceOptions.includes(zutat)
    );
    this.disabledAddSauces = [];
    return;
  }
}

  handleDeleteIngredientDelete(event: {
    gericht: Gericht;
    entfernte: { zutaten: string[]; salat: string[] };
  }) {
    this.deletedIngredients = {
      zutaten: event.entfernte.zutaten.map(z => this.capitalizeFirstLetter(z)),
      salat: event.entfernte.salat.map(s => this.capitalizeFirstLetter(s))
    };

    this.handleMainSaladDeleteSubstitutions()
    this.handleSaladDeleteSubstitutions();
    this.handleDeleteSubstitutions();
    this.calculateFinalPrice();
    this.openOverview();
  }

  handleAddIngredients(added: { zutaten: string[]; salat: string[] }) {
    this.addedIngredients = {
      zutaten: added.zutaten.map(e => this.capitalizeFirstLetter(e)),
      salat: added.salat.map(s => this.capitalizeFirstLetter(s))
    };

      this.handleMainSaladAddSubstitutions(added.zutaten);
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

    this.handleMainSaladDeleteSubstitutions()
    this.handleSaladDeleteSubstitutions();
    this.handleDeleteSubstitutions();
    this.calculateFinalPrice();
  }

  liveAddUpdate(added: { zutaten: string[]; salat: string[] }) {
    this.addedIngredients = {
      zutaten: added.zutaten.map(e => this.capitalizeFirstLetter(e)),
      salat: added.salat.map(s => this.capitalizeFirstLetter(s))
    };

      this.handleMainSaladAddSubstitutions(added.zutaten);
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
