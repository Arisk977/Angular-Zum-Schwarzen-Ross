import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeisenGerichtComponent } from './speisen-gericht/speisen-gericht.component';

@Component({
  selector: 'app-speisen-gruppe',
  standalone: true,
  imports: [CommonModule, SpeisenGerichtComponent],
  templateUrl: './speisen-gruppe.component.html',
  styleUrl: './speisen-gruppe.component.scss'
})
export class SpeisenGruppeComponent {
  @Input() gruppe: { unterKategorie: string | null; gerichte: any[] } = { unterKategorie: null, gerichte: [] };
  @Output() gerichtSelected = new EventEmitter<any>();

  onGerichtClicked(gericht: any) {
    this.gerichtSelected.emit(gericht);
  }
}
