import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-meals-banner',
  imports: [CommonModule],
  templateUrl: './meals-banner.component.html',
  styleUrl: './meals-banner.component.scss'
})
export class MealsBannerComponent {
@Input() title!: string;
  @Input() backgroundImage!: string; 
   @Output() clicked = new EventEmitter<string>();

  onBannerClick() {
    this.clicked.emit(this.title);
  }
}
