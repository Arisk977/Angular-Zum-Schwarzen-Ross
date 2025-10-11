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
  @Output() selectionSubmitted = new EventEmitter<string[]>();

  selectedExtras: string[] = [];

  extrasList: string[] = [
    'Oliven', 'Sucuk', 'Mais', 'Champignons', 'Mozzarella', 'Paprika'
  ]; // später dynamisch aus JSON laden

  toggleExtra(extra: string) {
    const index = this.selectedExtras.indexOf(extra);
    if (index === -1) {
      this.selectedExtras.push(extra);
    } else {
      this.selectedExtras.splice(index, 1);
    }
  }

  submitSelection() {
    this.selectionSubmitted.emit(this.selectedExtras);
  }
}
