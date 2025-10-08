import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import { WarenkorbComponent } from '../../../warenkorb/warenkorb.component';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, WarenkorbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  initials = '';
  avatarColor = '#999';
  menuOpen = false;
  cartOpen = false;
  cartCount = 0;
  cartAnimate = false;

  constructor(private auth: Auth, private firestore: Firestore) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.setUserAvatar(user);
      } else {
        this.isLoggedIn = false;
        this.menuOpen = false;
      }
    });
  }

  updateCartCount(newCount: number) {
    this.cartCount = newCount;
    this.cartAnimate = true;

    setTimeout(() => (this.cartAnimate = false), 500);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }

  logout() {
    signOut(this.auth);
    this.menuOpen = false;
  }

  private async setUserAvatar(user: User) {
    const userRef = doc(this.firestore, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as any;
      const first = data.vorname?.trim() || '';
      const last = data.nachname?.trim() || '';

      this.initials = (first[0] + (last[0] || '')).toUpperCase();
      this.avatarColor = data.avatarColor || '#b40000ff';
    } else {
      this.initials = '';
      this.avatarColor = '#999';
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.avatar-wrapper')) {
      this.menuOpen = false;
    }
  }
}