import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertDialog } from '../../shared/alert/alert';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-fg',
  standalone: true,
  templateUrl: './password-fg.html',
  styleUrls: ['./password-fg.css'],
  imports: [CommonModule, FormsModule, RouterModule, AlertDialog]
})
export class PasswordFG implements OnInit, OnDestroy {
  email = '';
  loading = false;
  successMsg = '';
  errorMsg = '';
  isAuthenticated = false;
  private loggedEmail: string | null = null;
  private profileSub?: Subscription;

  constructor(private router: Router, private userSession: UserSessionService) {}

  ngOnInit() {
    this.profileSub = this.userSession.ensureProfileLoaded().subscribe((profile) => {
      this.resolveSession(profile);
    });
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
  }

  onReturnToLogin() {
    this.router.navigate(['/login']);
  }

  submit() {
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.isAuthenticated || !this.loggedEmail) {
      this.errorMsg = 'Debes iniciar sesión para continuar.';
      return;
    }
    if (!this.email) {
      this.errorMsg = 'Ingresa tu correo registrado.';
      return;
    }

    const typedEmail = this.email.trim().toLowerCase();
    const sessionEmail = this.loggedEmail.trim().toLowerCase();
    if (typedEmail !== sessionEmail) {
      this.errorMsg = 'El correo no coincide con la sesión activa.';
      return;
    }

    this.successMsg = 'Identidad verificada. Redirigiendo para cambiar la contraseña...';
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/password-chg']);
    }, 800);
  }

  private resolveSession(profile: UserProfile | null) {
    const snapshot = profile || this.userSession.snapshot;
    if (snapshot?.email) {
      this.isAuthenticated = true;
      this.loggedEmail = snapshot.email;
      this.email = snapshot.email;
      this.errorMsg = '';
      return;
    }
    if (this.userSession.getToken()) {
      this.isAuthenticated = true;
      this.loggedEmail = null;
      return;
    }
    this.isAuthenticated = false;
    this.loggedEmail = null;
    this.errorMsg = 'Debes iniciar sesión antes de continuar.';
  }
}
