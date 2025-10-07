import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/component/header/header.component';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule  } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      await this.authService.loginWithEmail(this.email, this.password, this.rememberMe);
      alert('✅ Erfolgreich eingeloggt!');
      this.router.navigate(['/']); // z. B. zur Startseite
    } catch (err: any) {
      console.error('❌ Login-Fehler:', err);
      alert('Login fehlgeschlagen: ' + err.message);
    }
  }
}
