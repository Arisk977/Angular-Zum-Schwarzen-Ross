import { Injectable } from '@angular/core';
import { Auth, signInWithPhoneNumber, signOut } from '@angular/fire/auth';
import { getAuth, RecaptchaVerifier } from 'firebase/auth'; // ⬅️ wichtig: aus "firebase/auth" importieren
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private confirmationResult?: any;
  userPhone$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) {}

  /** 🧩 Initialisiert Recaptcha (unsichtbar oder sichtbar möglich) */
setupRecaptcha(containerId: string) {
  const auth = getAuth(); // 🔹 hole aktuelle Auth-Instanz
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  verifier.render(); // wichtig!
  return verifier;
}

  /** 📲 SMS-Code anfordern */
  async sendVerificationCode(phoneNumber: string, verifier: RecaptchaVerifier) {
    this.confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, verifier);
    console.log('✅ Code gesendet an', phoneNumber);
  }

  /** 🔐 SMS-Code bestätigen */
  async verifyCode(code: string) {
    if (!this.confirmationResult) throw new Error('Keine Anfrage vorhanden');

    const result = await this.confirmationResult.confirm(code);
    const phone = result.user.phoneNumber;
    this.userPhone$.next(phone);

    console.log('🎉 Eingeloggt als', phone);
    return result.user;
  }

  /** 🚪 Logout */
  async logout() {
    await signOut(this.auth);
    this.userPhone$.next(null);
    console.log('👋 User ausgeloggt');
  }
}
