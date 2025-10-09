import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-zutaten-modal',
  imports: [CommonModule],
  templateUrl: './zutaten-modal.component.html',
  styleUrl: './zutaten-modal.component.scss'
})
export class ZutatenModalComponent {
  private flowMap: Record<string, string> = {
    'vorspeisen': 'default',
    'salate': 'zutaten',
    'kleine gerichte': 'default',
    'burger': 'burger',
    'überbackene nudeln': 'zutaten',
    'nudelgerichte': 'zutaten',
    'pizzen': 'pizza',
    'schnitzelgerichte': 'default',
    'unsere spezialitäten': 'default',
    'argentinische rindersteaks': 'steak',
    'fischgerichte': 'zutaten',
    'indische & pakistanische spezialitäten': 'zutaten',
    'dessert & extras': 'default',
    'getränke': 'default'
  };
  @Input() gericht: any;

  constructor(public activeModal: NgbActiveModal) { }

  get flowType(): string {
    const kat = this.gericht?.kategorie?.toLowerCase();
    return this.flowMap[kat] ?? 'default';
  }

  close() {
    this.activeModal.close();
  }
}
