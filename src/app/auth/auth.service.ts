import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Inicia el flujo de recuperación: el backend envía el email con enlace
  requestPasswordReset(email: string): Observable<string> {
    const url = `${this.baseUrl}/auth/forgot-password`;
    return this.http
      .post<ApiResponse>(url, { email })
      .pipe(map(res => res.message || 'Si el correo existe, enviamos un enlace.'));
  }

  // Completa el cambio con el token y la nueva contraseña
  resetPassword(token: string, newPassword: string): Observable<string> {
    const url = `${this.baseUrl}/auth/reset-password`;
    return this.http
      .post<ApiResponse>(url, { token, password: newPassword })
      .pipe(map(res => res.message || 'Contraseña actualizada correctamente.'));
  }
}
