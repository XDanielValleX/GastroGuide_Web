import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ necesario para routerLink
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertDialog } from '../../shared/alert/alert';
import { finalize } from 'rxjs/operators';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, AlertDialog] // ✅ agregado RouterModule y HttpClientModule
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userSession: UserSessionService
  ) { }

  // ✅ Métodos para los botones de navegación
  onForgotPassword() {
    this.router.navigate(['/password-fg']);
  }

  onRegister() {
    this.router.navigate(['/signup']);
  }

  // Navegar a la raíz al hacer click en el logo
  goHome() {
    this.router.navigate(['/']);
  }

  // Maneja el submit del formulario de login
  onSubmit(form: NgForm) {
    if (!form) {
      return;
    }
    this.error = null;
    if (form.invalid) {
      this.error = 'Por favor completa email y password';
      return;
    }

    const sanitizedEmail = (this.email || '').trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitizedEmail)) {
      this.error = 'Ingresa un email válido.';
      return;
    }

    this.email = sanitizedEmail;

    this.loading = true;
    const url = `${environment.apiUrl}/api/v1/auth/login`;
    this.http.post<any>(url, { email: this.email, password: this.password })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
      next: (resp) => {
        // Intentar extraer el token de forma flexible
        const token = resp?.token || resp?.accessToken || resp?.access_token || resp?.data?.token;
            if (token) {
              localStorage.setItem('token', token);
            } else {
              // Si no viene token explícito, guardar la respuesta completa (por compatibilidad)
              localStorage.setItem('auth', JSON.stringify(resp));
            }

            // Intentar cachear el perfil usando los datos devueltos por el backend
            const profileFromResponse = this.extractUserProfile(resp);
            if (profileFromResponse) {
              this.userSession.persistUser(profileFromResponse);
            }

            // Refrescar datos del usuario para sincronizar con la API oficial
            this.userSession.refreshFromApi().subscribe();

        // Redirigir a la ruta principal (ajusta según tu app)
        this.router.navigate(['/home2']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err?.error?.message || err?.message || 'Error en login';
      }
    });
  }


  private extractUserProfile(resp: any): Partial<UserProfile> | null {
    if (!resp) {
      return null;
    }

    const candidate = resp.user || resp.profile || resp.data?.user || resp.data?.profile || resp.data;
    if (candidate && (candidate.name || candidate.username || candidate.email)) {
      return {
        name: candidate.name,
        username: candidate.username,
        email: candidate.email,
        image: candidate.image
      };
    }

    // Como último recurso, guardar sólo el correo que acaba de iniciar sesión
    if (this.email) {
      return { email: this.email };
    }

    return null;
  }
}
