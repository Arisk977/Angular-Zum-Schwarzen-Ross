import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeisenGruppeComponent } from '../speisen-gruppe/speisen-gruppe.component';
import { Speisekarte, Gericht } from '../../interfaces/speisekarte.interface';

@Component({
  selector: 'app-speisen-modal',
  standalone: true,
  imports: [CommonModule, SpeisenGruppeComponent],
  templateUrl: './speisen-modal.component.html',
  styleUrl: './speisen-modal.component.scss'
})
export class SpeisenModalComponent {
  @Input() title: string = '';
  @Input() gerichte: Gericht[] = [];
  @Input() kategorien: string[] = []; // ✅ vom Haupt-Component übergeben
  @Input() currentIndex: number = 0; // ✅ aktuelle Kategorieposition
  @Input() speisen: Speisekarte = {}; // ✅ vollständige Daten für Navigation

  constructor(public activeModal: NgbActiveModal) {}

  close() {
    this.activeModal.close();
  }

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
      for (const [unterKategorie, gerichte] of Object.entries(kategorie as Record<string, Gericht[]>)) {
        this.gerichte.push(...gerichte.map(g => ({ ...g, unterKategorie })));
      }
    }
  }
}
