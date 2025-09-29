import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-meals-banner',
  imports: [CommonModule],
  templateUrl: './meals-banner.component.html',
  styleUrl: './meals-banner.component.scss'
})
export class MealsBannerComponent {
@Input() title: string = '';                     // Text im <div>
  @Input() backgroundImage: string = ''; 
   @Output() bannerClick = new EventEmitter<void>();

  onClick() {
    this.bannerClick.emit();
  }
}
