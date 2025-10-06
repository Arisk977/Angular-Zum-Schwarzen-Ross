import { Routes } from '@angular/router';
import { SpeisenComponent } from './speisen/speisen.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full' },
    { path: 'speisen', component: SpeisenComponent },
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'warenkorb', loadComponent: () => import('./warenkorb/warenkorb.component').then(m => m.WarenkorbComponent) },
  { path: 'bestellungen', loadComponent: () => import('./bestellungen/bestellungen.component').then(m => m.BestellungenComponent) },

];
