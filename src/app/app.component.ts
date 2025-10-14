import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/component/loading-spinner/loading-spinner.component';
import { CartService } from './shared/services/cart.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'zum-schwarzen-ross';
    loading = false;

  constructor(private router: Router, private cartService: CartService, private auth: Auth) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
      }
    });
  }

   ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        console.log('✅ User eingeloggt:', user.uid);
        this.cartService.startCartListener();
      } else {
        console.log('🚪 User ausgeloggt');
        this.cartService.stopCartListener();
      }
    });
  }
}
