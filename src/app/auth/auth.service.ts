import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  userEmail$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) {}

  async loginWithEmail(email: string, password: string, rememberMe: boolean) {
    // 🔹 Login bleibt erhalten, wenn "Remember Me" aktiviert ist
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistence);

    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    this.userEmail$.next(credential.user.email);
    console.log('🎉 Eingeloggt als:', credential.user.email);
    return credential.user;
  }

  logout() {
    this.auth.signOut();
    this.userEmail$.next(null);
  }
}
