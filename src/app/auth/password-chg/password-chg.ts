import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertDialog } from '../../shared/alert/alert';

@Component({
  selector: 'app-password-chg',
  standalone: true,
  templateUrl: './password-chg.html',
  styleUrls: ['./password-chg.css'],
  imports: [CommonModule, FormsModule, AlertDialog]
})
export class PasswordCHG {
  password = '';
  confirmPassword = '';
  token: string | null = null;
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location
  ) {
    // Acepta token tanto por query (?token=...) como por parámetro (/password-chg/:token)
    this.token = this.route.snapshot.queryParamMap.get('token')
      || this.route.snapshot.paramMap.get('token');
  }

  // Navegar hacia atrás
  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  submit(form?: NgForm) {
    this.successMsg = '';
    this.errorMsg = '';
    if (form && form.invalid) {
      this.errorMsg = 'Completa los campos requeridos.';
      return;
    }
    if (!this.token) {
      this.errorMsg = 'Enlace inválido o token ausente.';
      return;
    }
    if (!this.password || this.password.length < 8) {
      this.errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    const url = `${environment.apiUrl}/auth/reset-password`;
    this.http
      .post<{ message?: string }>(url, { token: this.token, password: this.password })
      .subscribe({
        next: (res) => {
          this.successMsg = res?.message || 'Contraseña actualizada. Puedes iniciar sesión.';
          this.loading = false;
          form?.resetForm();
          this.password = '';
          this.confirmPassword = '';
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo actualizar la contraseña.';
          this.loading = false;
        }
      });
  }
}
