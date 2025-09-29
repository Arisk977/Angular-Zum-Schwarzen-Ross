import { Component } from '@angular/core';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { LieferserviceComponent } from '../lieferservice/lieferservice.component';
import { CateringComponent } from '../catering/catering.component';
import { SpeisenComponent } from '../speisen/speisen.component';


@Component({
  selector: 'app-main',
  imports: [LandingPageComponent, LieferserviceComponent, CateringComponent, SpeisenComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
