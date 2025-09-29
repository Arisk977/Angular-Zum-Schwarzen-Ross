import { Component } from '@angular/core';
import { MealsBannerComponent } from './meals-banner/meals-banner.component';

@Component({
  selector: 'app-speisen',
  imports: [MealsBannerComponent],
  templateUrl: './speisen.component.html',
  styleUrl: './speisen.component.scss'
})
export class SpeisenComponent {

  onClick(){
    console.log('test erfolgreich');
  }
}
