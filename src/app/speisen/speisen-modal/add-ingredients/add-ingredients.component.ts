import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-ingredients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-ingredients.component.html',
  styleUrls: ['./add-ingredients.component.scss']
})
export class AddIngredientsComponent {
  @Input() gericht: any;
  @Output() back = new EventEmitter<void>();

  // ⚡️ Emit nun ein Objekt statt Array
  @Output() selectionSubmitted = new EventEmitter<{ extras: string[]; salat: string[] }>();
  @Output() selectionChanged = new EventEmitter<{ extras: string[]; salat: string[] }>();

  selectedExtras: string[] = [];
  selectedSalatExtras: string[] = [];

  extrasList: string[] = [
    'Oliven', 'Sucuk', 'Mais', 'Champignons', 'Mozzarella', 'Paprika'
  ]; // später dynamisch aus JSON laden

  salatExtras: string[] = ['Joghurtsoße', 'Essig Öl', 'Balsamico', 'Mais', 'Paprika'];

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
      extras: [...this.selectedExtras],
      salat: [...this.selectedSalatExtras]
    };
    this.selectionChanged.emit(selectionObject);
  }

  submitSelection() {
    const selectionObject = {
      extras: [...this.selectedExtras],
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
