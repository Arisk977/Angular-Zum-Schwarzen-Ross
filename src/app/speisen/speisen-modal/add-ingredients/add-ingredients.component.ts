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


  @Output() back = new EventEmitter<void>();
  @Output() selectionSubmitted = new EventEmitter<{ zutaten: string[]; salat: string[] }>();
  @Output() selectionChanged = new EventEmitter<{ zutaten: string[]; salat: string[] }>();

  selectedExtras: string[] = [];
  selectedSalatExtras: string[] = [];
  extrasList: string[] = [];

  salatExtras: string[] = ['Joghurtsoße', 'Essig Öl', 'Balsamico', 'Mais', 'Paprika'];


  ngOnInit() {
    this.loadExtrasForCategory();
      if (this.preselectedExtras) {
    this.selectedExtras = [...this.preselectedExtras.zutaten];
    this.selectedSalatExtras = [...this.preselectedExtras.salat];
  }
  }

  ngOnChanges(){
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
    const index = this.selectedExtras.indexOf(extra);
    if (index === -1) {
      this.selectedExtras.push(extra);
    } else {
      this.selectedExtras.splice(index, 1);
    }
    this.emitSelection();
  }

  toggleSalatExtra(extra: string) {
    const index = this.selectedSalatExtras.indexOf(extra);
    if (index === -1) {
      this.selectedSalatExtras.push(extra);
    } else {
      this.selectedSalatExtras.splice(index, 1);
    }
    this.emitSelection();
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

  shouldShowSalatExtras(): boolean {
    const hasSalat = this.gericht?.zutaten?.includes('Salat');
    const salatSelected = this.selectedExtras.includes('Salat');
    return !!hasSalat && !salatSelected;
  }
}
