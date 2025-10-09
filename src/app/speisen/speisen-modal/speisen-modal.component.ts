import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpeisenGruppeComponent } from '../speisen-gruppe/speisen-gruppe.component';
import { Speisekarte, Gericht } from '../../interfaces/speisekarte.interface';
import { ZutatenModalComponent } from '../zutaten-modal/zutaten-modal.component';

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
  @Input() kategorien: string[] = [];
  @Input() currentIndex: number = 0;
  @Input() speisen: Speisekarte = {};

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  close() {
    this.activeModal.close();
  }

  groupByUnterkategorie(
    gerichte: any[]
  ): { unterKategorie: string | null; gerichte: any[] }[] {
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

  openGerichtDetail(gericht: Gericht) {
    const modalRef = this.modalService.open(ZutatenModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.gericht = {
      ...gericht,
      kategorie: this.title // ✅ Kategorie mitgeben
    };
  }
}
