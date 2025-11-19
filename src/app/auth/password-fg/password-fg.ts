import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  constructor(private router: Router, private http: HttpClient) {}

  onReturnToLogin() {
    this.router.navigate(['/login']);
  }

  submit() {
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.email) return;
    this.loading = true;
    const url = `${environment.apiUrl}/auth/forgot-password`;
    this.http
      .post<{ message?: string }>(url, { email: this.email })
      .subscribe({
        next: (res: { message?: string }) => {
          this.successMsg = res?.message || 'Si el correo existe, enviamos un enlace.';
          this.loading = false;
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message || 'No pudimos procesar la solicitud.';
          this.loading = false;
        }
      });
  }
}
