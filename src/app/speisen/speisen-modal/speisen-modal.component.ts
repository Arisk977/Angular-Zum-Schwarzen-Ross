import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeisenGruppeComponent } from '../speisen-gruppe/speisen-gruppe.component';

@Component({
  selector: 'app-speisen-modal',
  standalone: true,
  imports: [CommonModule, SpeisenGruppeComponent],
  templateUrl: './speisen-modal.component.html',
  styleUrl: './speisen-modal.component.scss'
})
export class SpeisenModalComponent {
  @Input() title: string = '';
  @Input() gerichte: any[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  groupByUnterkategorie(gerichte: any[]): { unterKategorie: string | null, gerichte: any[] }[] {
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

  close() {
  console.log('Close clicked'); // Test
  this.activeModal.close();
}

}
