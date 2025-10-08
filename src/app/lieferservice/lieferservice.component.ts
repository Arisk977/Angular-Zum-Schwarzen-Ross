import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/component/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lieferservice',
  imports: [ButtonComponent, RouterModule],
  templateUrl: './lieferservice.component.html',
  styleUrl: './lieferservice.component.scss'
})
export class LieferserviceComponent {

}
