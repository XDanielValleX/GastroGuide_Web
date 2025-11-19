import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-password-chg',
  standalone: true,
  templateUrl: './password-chg.html',
  styleUrls: ['./password-chg.css'],
  imports: [CommonModule, FormsModule]
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
    private auth: AuthService
  ) {
    // Acepta token tanto por query (?token=...) como por parámetro (/password-chg/:token)
    this.token = this.route.snapshot.queryParamMap.get('token')
      || this.route.snapshot.paramMap.get('token');
  }

  // Métodos de navegación
  onReturnToLogin() {
    this.router.navigate(['/login']);
  }

  submit() {
    this.successMsg = '';
    this.errorMsg = '';
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
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (msg) => {
        this.successMsg = msg || 'Contraseña actualizada. Puedes iniciar sesión.';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la contraseña.';
        this.loading = false;
      }
    });
  }
}
