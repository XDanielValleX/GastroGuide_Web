import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { UserSessionService } from '../../shared/user-session.service';

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

  constructor(private http: HttpClient, private userSession: UserSessionService) {}

  promote() {
    const rawEmail = (this.email || '').trim().toLowerCase();
    if (!rawEmail) {
      this.message = 'Por favor ingresa un correo válido';
      return;
    }

    const url = `${environment.apiUrl}/api/v1/auth/promote-to-creator`;
    this.http.post(url, { email: rawEmail })
      .subscribe({
        next: (res: any) => {
          this.message = `✅ El usuario ${res.username} ahora es CREATOR`;
          this.syncSessionRole();
        },
        error: (err) => {
          console.error(err);
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
}
