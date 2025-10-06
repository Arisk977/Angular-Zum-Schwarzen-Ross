import { Routes } from '@angular/router';
import { SpeisenComponent } from './speisen/speisen.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full' },
    { path: 'speisen', component: SpeisenComponent },
];
