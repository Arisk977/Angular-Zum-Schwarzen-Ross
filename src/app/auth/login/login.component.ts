import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/component/header/header.component';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
 phoneNumber = '';
  verificationCode = '';
  step = 1; // 1 = Eingabe Telefonnummer, 2 = Code-Eingabe

  constructor(private authService: AuthService) {}

  async sendCode() {
    const verifier = this.authService.setupRecaptcha('recaptcha-container');
    await this.authService.sendVerificationCode(this.phoneNumber, verifier);
    this.step = 2;
  }

  async confirmCode() {
    await this.authService.verifyCode(this.verificationCode);
    alert('Erfolgreich eingeloggt!');
  }
}