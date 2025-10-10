import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-speisen-gericht',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speisen-gericht.component.html',
  styleUrl: './speisen-gericht.component.scss'
})
export class SpeisenGerichtComponent {
  @Input() gericht: any;
  @Input() alternate: boolean = false;
    @Output() gerichtClicked = new EventEmitter<any>();

   onClick() {
    this.gerichtClicked.emit(this.gericht);
  }
}
