import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-password-fg',
  standalone: true,
  templateUrl: './password-fg.html',
  styleUrls: ['./password-fg.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PasswordFG {
  email = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private router: Router, private auth: AuthService) {}

  onReturnToLogin() {
    this.router.navigate(['/login']);
  }

  submit() {
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.email) return;
    this.loading = true;
    this.auth.requestPasswordReset(this.email).subscribe({
      next: (msg) => {
        this.successMsg = msg || 'Si el correo existe, enviamos un enlace.';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No pudimos procesar la solicitud.';
        this.loading = false;
      }
    });
  }
}
