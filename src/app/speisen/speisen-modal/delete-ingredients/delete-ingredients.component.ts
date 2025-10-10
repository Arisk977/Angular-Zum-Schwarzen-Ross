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
  @Output() selectionSubmitted = new EventEmitter<{ gericht: Gericht; entfernteZutaten: string[] }>();
  @Output() back = new EventEmitter<void>();

  selectedZutaten: boolean[] = [];

  submitSelection() {
    const gewaehlteZutaten =
      this.gericht.zutaten?.filter((_, i) => this.selectedZutaten[i]) || [];

    console.log('✅ Ausgewählte Zutaten zum Entfernen:', gewaehlteZutaten);

    this.selectionSubmitted.emit({
      gericht: this.gericht,
      entfernteZutaten: gewaehlteZutaten
    });
  }
}