import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { HeaderComponent } from '../shared/component/header/header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    password: ''
  };

  privacyAccepted = false;
  private randomColor(): string {
    const colors = ['#FF8A80', '#FFB74D', '#81C784', '#64B5F6', '#BA68C8', '#F06292'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) { }

  async register() {
    try {
      if (!this.privacyAccepted) {
        alert('Bitte akzeptiere die Datenschutzrichtlinie.');
        return;
      }

      const credential = await createUserWithEmailAndPassword(
        this.auth,
        this.user.email,
        this.user.password
      );

      const avatarColor = this.randomColor();

      const userRef = doc(this.firestore, `users/${credential.user.uid}`);
      await setDoc(userRef, {
        vorname: this.user.firstName,
        nachname: this.user.lastName,
        adresse: {
          strasse: this.user.street,
          hausnummer: this.user.houseNumber,
          plz: this.user.postalCode,
          ort: this.user.city
        },
        telefonnummer: this.user.phone,
        email: this.user.email,
        avatarColor: avatarColor,
        createdAt: new Date().toISOString()
      });

      alert('✅ Registrierung erfolgreich!');
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('❌ Fehler bei der Registrierung:', err);
      alert('Fehler bei der Registrierung: ' + err.message);
    }
  }
}
