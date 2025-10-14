import { Routes } from '@angular/router';
import { SpeisenComponent } from './speisen/speisen.component';
import { MainComponent } from './main/main.component';
import { RegisterComponent } from './register/register.component';
import { CheckoutComponent } from './checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: MainComponent, pathMatch: 'full' },
  { path: 'speisen', component: SpeisenComponent },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', component: RegisterComponent },
  { path: 'warenkorb', loadComponent: () => import('./warenkorb/warenkorb.component').then(m => m.WarenkorbComponent) },
  { path: 'bestellungen', loadComponent: () => import('./bestellungen/bestellungen.component').then(m => m.BestellungenComponent) },
  { path: 'checkout', component: CheckoutComponent },

];
