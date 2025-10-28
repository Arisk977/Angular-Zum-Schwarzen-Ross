import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import extrasData from '../../../../assets/json/add-ingredients.json';


@Component({
  selector: 'app-add-ingredients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-ingredients.component.html',
  styleUrls: ['./add-ingredients.component.scss']
})
export class AddIngredientsComponent implements OnInit {
  @Input() gericht: any;
  @Input() title: string = '';
  @Input() preselectedExtras: { zutaten: string[], salat: string[] } = { zutaten: [], salat: [] };
  @Input() disabledAddSauces: string[] = [];


  @Output() back = new EventEmitter<void>();
  @Output() selectionSubmitted = new EventEmitter<{ zutaten: string[]; salat: string[] }>();
  @Output() selectionChanged = new EventEmitter<{ zutaten: string[]; salat: string[] }>();

  selectedExtras: string[] = [];
  selectedSalatExtras: string[] = [];
  extrasList: string[] = [];

  salatExtras: string[] = ['Joghurtsoße', 'Essig Öl', 'Balsamico', 'Mais', 'Paprika'];
  private sideOptions = ['Pommes', 'Reis', 'Kroketten', 'Bratkartoffel', 'Folienkartoffeln', 'Salzkartoffeln'];
  private sauceOptions = ['Joghurtsoße', 'Essig Öl', 'Balsamico'];

  ngOnInit() {
    this.loadExtrasForCategory();
    this.preSelection();
  }

  ngOnChanges() {
    this.preSelection();
  }

  private preSelection() {
    if (this.preselectedExtras) {
      this.selectedExtras = [...this.preselectedExtras.zutaten];
      this.selectedSalatExtras = [...this.preselectedExtras.salat];
    }
  }

  private loadExtrasForCategory() {
    const category = this.title;
    const dishName = this.gericht?.name || '';
    const data: any = extrasData;

    if (data[category]) {
      const categoryData = data[category];
      if (Array.isArray(categoryData)) {
        this.extrasList = categoryData;
      }
      else if (typeof categoryData === 'object') {
        this.extrasList = this.resolveExtrasForCategory(categoryData, dishName);
      }
      else {
        this.extrasList = [];
      }
    } else {
      this.extrasList = [];
    }
  }

  private resolveExtrasForCategory(categoryData: any, dishName: string): string[] {
    if (categoryData[dishName]) {
      return categoryData[dishName];
    } else if (categoryData['default']) {
      return categoryData['default'];
    } else {
      return [];
    }
  }



toggleExtra(extra: string) {
  if (this.handleSideSelection(extra)) return;
  if (this.handleSauceSelection(extra)) return;
  this.handleStandardExtra(extra);
}

private handleStandardExtra(extra: string) {
  const index = this.selectedExtras.indexOf(extra);

  if (index === -1) {
    this.selectedExtras.push(extra);
  } else {
    this.selectedExtras.splice(index, 1);
  }

  this.emitSelection();
}


private handleSauceSelection(extra: string): boolean {
  const index = this.selectedExtras.indexOf(extra);
  const isSauce = this.sauceOptions.includes(extra);

  if (!isSauce) return false;

  if (index !== -1) {
    this.selectedExtras.splice(index, 1);
    this.disabledAddSauces = [];
    this.emitSelection();
    return true;
  }

  this.selectedExtras = this.selectedExtras.filter(
    e => !this.sauceOptions.includes(e)
  );
  this.selectedExtras.push(extra);
  this.disabledAddSauces = this.sauceOptions.filter(s => s !== extra);
  this.emitSelection();
  return true;
}

private handleSideSelection(extra: string): boolean {
  const index = this.selectedExtras.indexOf(extra);
  const isSide = this.sideOptions.includes(extra);

  if (!isSide) return false;

  if (index !== -1) {
    this.selectedExtras.splice(index, 1);
    this.emitSelection();
    return true;
  }

  this.selectedExtras = this.selectedExtras.filter(
    e => !this.sideOptions.includes(e)
  );
  this.selectedExtras.push(extra);
  this.emitSelection();
  return true;
}

  toggleSalatExtra(extra: string) {
    const isSauce = this.sauceOptions.includes(extra);
    const index = this.selectedSalatExtras.indexOf(extra);
    const handled = this.disableSaladSauces(isSauce, index, extra);

    if (handled) return;

    if (index === -1) {
      this.selectedSalatExtras.push(extra);
    } else {
      this.selectedSalatExtras.splice(index, 1);
    }

    this.emitSelection();
  }

  disableSaladSauces(isSauce: boolean, index: number, extra: string): boolean {
    if (isSauce && index !== -1) {
      this.selectedSalatExtras.splice(index, 1);
      this.emitSelection();
      return true;
    }

    if (isSauce) {
      this.selectedSalatExtras = this.selectedSalatExtras.filter(
        s => !this.sauceOptions.includes(s)
      );
      this.selectedSalatExtras.push(extra);
      this.emitSelection();
      return true;
    }

    return false;
  }

  private emitSelection() {
    const selectionObject = {
      zutaten: [...this.selectedExtras],
      salat: [...this.selectedSalatExtras]
    };
    this.selectionChanged.emit(selectionObject);
  }

  submitSelection() {
    const selectionObject = {
      zutaten: [...this.selectedExtras],
      salat: [...this.selectedSalatExtras]
    };
    this.selectionSubmitted.emit(selectionObject);
  }

  isSalatExtraSelected(extra: string): boolean {
    return this.selectedSalatExtras.includes(extra);
  }

  isOtherSideSelected(extra: string): boolean {
  const isSide = this.sideOptions.includes(extra);

  if (!isSide) return false;

  const selectedSides = this.selectedExtras.filter(s =>
    this.sideOptions.includes(s)
  );

  return selectedSides.length > 0 && !selectedSides.includes(extra);
}


  isOtherSauceSelected(extra: string): boolean {
    const isSauce = this.sauceOptions.includes(extra);

    if (!isSauce) return false;

    const selectedSauces = this.selectedSalatExtras.filter(s =>
      this.sauceOptions.includes(s)
    );

    return selectedSauces.length > 0 && !selectedSauces.includes(extra);
  }

  shouldShowSalatExtras(): boolean {
    const hasSalat = this.gericht?.zutaten?.includes('Salat');
    const salatSelected = this.selectedExtras.includes('Salat');
    return !!hasSalat && !salatSelected;
  }
}
