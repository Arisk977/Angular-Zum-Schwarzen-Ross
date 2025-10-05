import { Component, OnInit } from '@angular/core';
import { MealsBannerComponent } from './meals-banner/meals-banner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Gericht, Speisekarte } from './../interfaces/speisekarte.interface';
import { HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-speisen',
  standalone: true,
  imports: [MealsBannerComponent, CommonModule],
  templateUrl: './speisen.component.html',
  styleUrl: './speisen.component.scss'
})
export class SpeisenComponent implements OnInit{
  speisen: Speisekarte = {};
  selectedTitle = '';
  gefilterteGerichte: Gericht[] = [];

  constructor(private http: HttpClient, private modalService: NgbModal) {}

   ngOnInit() {
  this.http.get<Speisekarte>('assets/json/speisekarte_complete.json').subscribe({
    next: (daten) => (this.speisen = daten),
    error: (err) => console.error('❌ Fehler beim Laden der Speisekarte:', err)
  });
}


openScrollable(content: any, title: string) {
  this.selectedTitle = title;
  const kategorie = this.speisen[title];

  if (Array.isArray(kategorie)) {
    // 🔹 einfache Kategorie (z. B. "Pizzen", "Vorspeisen")
    this.gefilterteGerichte = kategorie;
  } 
  else if (typeof kategorie === 'object' && kategorie !== null) {
    // 🔹 verschachtelte Kategorie (z. B. "Dessert & Extras")
    this.gefilterteGerichte = [];

    for (const [unterKategorie, gerichte] of Object.entries(kategorie as Record<string, Gericht[]>)) {
      this.gefilterteGerichte.push(
        ...gerichte.map(g => ({
          ...g,
          unterKategorie // Zusatzfeld zur Anzeige im Modal
        }))
      );
    }
  } 
  else {
    // 🔹 keine Daten gefunden
    this.gefilterteGerichte = [];
  }

  // 🔹 Modal öffnen (fehlt bisher!)
  this.modalService.open(content, { scrollable: true, size: 'lg' });
}

groupByUnterkategorie(gerichte: any[]): { unterKategorie: string | null, gerichte: any[] }[] {
  const gruppen: Record<string, any[]> = {};

  for (const g of gerichte) {
    // Falls keine Unterkategorie vorhanden → leerer String
    const key = g.unterKategorie || '';
    if (!gruppen[key]) gruppen[key] = [];
    gruppen[key].push(g);
  }

  return Object.entries(gruppen).map(([unterKategorie, gerichte]) => ({
    unterKategorie: unterKategorie || null,
    gerichte
  }));
}



}