import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // ✅ importiere HttpClient provider
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()), provideFirebaseApp(() => 
      initializeApp({ 
        projectId: "zum-schwarzen-ross", 
        appId: "1:853990112853:web:3fd687aa2b225c2c959edc", 
        storageBucket: "zum-schwarzen-ross.firebasestorage.app", 
        apiKey: "AIzaSyBG3p9i3w1aBOAirfVMUuGX5goHMYu2nAA", 
        authDomain: "zum-schwarzen-ross.firebaseapp.com", 
        messagingSenderId: "853990112853", 
})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
