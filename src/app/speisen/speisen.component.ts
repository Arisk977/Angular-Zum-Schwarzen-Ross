import { Component, OnInit } from '@angular/core';
import { MealsBannerComponent } from './meals-banner/meals-banner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Gericht, Speisekarte } from './../interfaces/speisekarte.interface';
import { HttpClient } from '@angular/common/http';
import { SpeisenModalComponent } from './speisen-modal/speisen-modal.component';

@Component({
  selector: 'app-speisen',
  standalone: true,
  imports: [MealsBannerComponent, CommonModule],
  templateUrl: './speisen.component.html',
  styleUrl: './speisen.component.scss'
})
export class SpeisenComponent implements OnInit {
  speisen: Speisekarte = {};
  selectedTitle = '';
  gefilterteGerichte: Gericht[] = [];

  constructor(private http: HttpClient, private modalService: NgbModal) { }

  ngOnInit() {
    this.http.get<Speisekarte>('assets/json/speisekarte_complete.json').subscribe({
      next: (daten) => (this.speisen = daten),
      error: (err) => console.error('❌ Fehler beim Laden der Speisekarte:', err)
    });
  }

  openScrollable(title: string) {
    this.selectedTitle = title;

    const kategorie = this.speisen[title];

    let gefilterteGerichte: any[] = [];

    if (Array.isArray(kategorie)) {
      gefilterteGerichte = kategorie;
    } else if (typeof kategorie === 'object' && kategorie !== null) {
      for (const [unterKategorie, gerichte] of Object.entries(kategorie as Record<string, any[]>)) {
        gefilterteGerichte.push(
          ...gerichte.map(g => ({
            ...g,
            unterKategorie
          }))
        );
      }
    }

    const modalRef = this.modalService.open(SpeisenModalComponent, { scrollable: true, size: 'lg' });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.gerichte = gefilterteGerichte;
  }
}
