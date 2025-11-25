import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';

@Component({
  selector: 'app-switch-to-creator',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './switch-to-creator.html',
  styleUrls: ['./switch-to-creator.css']
})
export class SwitchToCreator {
  email: string = '';
  message: string = '';
  private redirectingToLogin = false;

  constructor(private http: HttpClient, private userSession: UserSessionService, private router: Router) {}

  promote(form?: NgForm) {
    this.message = '';
    if (form && form.invalid) {
      this.message = 'Por favor ingresa un correo válido';
      return;
    }

    const rawEmail = (this.email || '').trim().toLowerCase();
    this.email = rawEmail;
    if (!rawEmail) {
      this.message = 'Por favor ingresa un correo válido';
      return;
    }

    const url = `${environment.apiUrl}/api/v1/auth/promote-to-creator`;
    this.http.post(url, { email: rawEmail })
      .subscribe({
        next: (res: any) => {
          this.persistPromotionSession(res);
          this.message = `✅ El usuario ${res.username} ahora es CREATOR`;
          this.syncSessionRole();
        },
        error: (err) => {
          console.error(err);
          if (this.isUnauthorizedError(err)) {
            this.forceReLogin('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }
          const detail = err?.error?.message || err?.message || 'No se pudo promover al usuario';
          this.message = `❌ ${detail}`;
        }
      });
  }

  private syncSessionRole() {
    const current = this.userSession.snapshot;
    if (!current?.email) {
      return;
    }
    const promoted = (this.email || '').trim().toLowerCase();
    if (promoted && current.email.trim().toLowerCase() === promoted) {
      this.userSession.persistUser({ role: 'CREATOR', roles: ['CREATOR'] });
    }
  }

  private persistPromotionSession(resp: any) {
    if (!resp) {
      return;
    }
    const token = resp?.token || resp?.accessToken || resp?.access_token || resp?.data?.token;
    try {
      localStorage.removeItem('token');
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('auth', JSON.stringify(resp));
    } catch {
      // ignore storage failures
    }

    const profile = this.buildProfileFromResponse(resp);
    if (profile) {
      this.userSession.persistUser(profile);
    }
  }

  private buildProfileFromResponse(resp: any): Partial<UserProfile> | null {
    const candidate = resp?.user || resp?.profile || resp?.data?.user || resp?.data?.profile || resp?.data || resp;
    if (!candidate) {
      return null;
    }
    const avatarValue = candidate?.avatar ?? resp?.avatar;
    const imageValue = candidate?.image ?? resp?.image ?? avatarValue;
    const roleValue = candidate?.role ?? resp?.role;
    const rolesValue = candidate?.roles ?? resp?.roles;
    const profile: Partial<UserProfile> = {
      id: candidate?.id ?? resp?.id,
      name: candidate?.name ?? resp?.name,
      username: candidate?.username ?? resp?.username,
      email: candidate?.email ?? resp?.email,
      image: imageValue,
      avatar: avatarValue ?? imageValue,
      role: typeof roleValue === 'string' ? roleValue : undefined,
      roles: Array.isArray(rolesValue) ? rolesValue : undefined,
      phoneNumber: candidate?.phoneNumber ?? resp?.phoneNumber,
      dateOfBirth: candidate?.dateOfBirth ?? resp?.dateOfBirth,
      active: candidate?.active ?? resp?.active,
      expiresIn: resp?.expiresIn ?? candidate?.expiresIn
    };

    if (!profile.username && profile.email) {
      profile.username = profile.email.split('@')[0];
    }

    if (!profile.name && (profile.username || profile.email)) {
      profile.name = profile.username || profile.email;
    }

    return profile.email || profile.username || profile.id ? profile : null;
  }

  private isUnauthorizedError(err: any): boolean {
    const status = err?.status ?? err?.error?.status;
    return status === 401 || status === 403;
  }

  private forceReLogin(displayMessage: string) {
    this.message = `❌ ${displayMessage}`;
    if (this.redirectingToLogin) {
      return;
    }
    this.redirectingToLogin = true;
    this.userSession.clearSession();
    this.router.navigate(['/login'], { queryParams: { redirectTo: 'switch-to-creator' } });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
