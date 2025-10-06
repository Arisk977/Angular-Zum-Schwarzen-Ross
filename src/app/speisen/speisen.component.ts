import { Component, OnInit } from '@angular/core';
import { MealsBannerComponent } from './meals-banner/meals-banner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Gericht, Speisekarte } from './../interfaces/speisekarte.interface';
import { HttpClient } from '@angular/common/http';
import { SpeisenModalComponent } from './speisen-modal/speisen-modal.component';
import { HeaderComponent } from '../shared/component/header/header.component';

@Component({
  selector: 'app-speisen',
  standalone: true,
  imports: [MealsBannerComponent, CommonModule, HeaderComponent],
  templateUrl: './speisen.component.html',
  styleUrl: './speisen.component.scss'
})
export class SpeisenComponent implements OnInit {
  speisen: Speisekarte = {};
  selectedTitle = '';
  gefilterteGerichte: Gericht[] = [];
  kategorien: string[] = [
    'Vorspeisen',
    'Salate',
    'Kleine Gerichte',
    'Burger',
    'Überbackene Nudeln',
    'Nudelgerichte',
    'Pizzen',
    'Schnitzelgerichte',
    'Unsere Spezialitäten',
    'Argentinische Rindersteaks',
    'Fischgerichte',
    'Indische & Pakistanische Spezialitäten',
    'Dessert & Extras',
    'Getränke'
  ];

  constructor(private http: HttpClient, private modalService: NgbModal) { }
  
  private erstelleModal(title: string, index: number) {
    const modalRef = this.modalService.open(SpeisenModalComponent, { scrollable: true, size: 'lg' });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.kategorien = this.kategorien;
    modalRef.componentInstance.currentIndex = index;
    modalRef.componentInstance.speisen = this.speisen;
    return modalRef;
  }

  private ermittleGerichteZuTitel(title: string): Gericht[] {
    const kategorie = this.speisen[title];

    if (Array.isArray(kategorie)) {
      return kategorie;
    }
    if (typeof kategorie === 'object' && kategorie !== null) {
      return this.extrahiereGerichteAusKategorie(kategorie as Record<string, Gericht[]>);
    }
    return [];
  }

  private extrahiereGerichteAusKategorie(kategorieObj: Record<string, Gericht[]>): Gericht[] {
    const gerichte: Gericht[] = [];
    for (const [unterKategorie, gruppe] of Object.entries(kategorieObj)) {
      gerichte.push(...gruppe.map(g => ({ ...g, unterKategorie })));
    }
    return gerichte;
  }
  ngOnInit() {
    this.http.get<Speisekarte>('assets/json/speisekarte_complete.json').subscribe({
      next: (daten) => (this.speisen = daten),
      error: (err) => console.error('❌ Fehler beim Laden der Speisekarte:', err)
    });
  }

  openScrollable(title: string) {
    const index = this.kategorien.indexOf(title);
    const modalRef = this.erstelleModal(title, index);

    const gerichte = this.ermittleGerichteZuTitel(title);
    modalRef.componentInstance.gerichte = gerichte;
  }


}
