import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../services/toast.service';

import { RouterModule } from '@angular/router'; // ✅ necesario para routerLink
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule] // ✅ agregado RouterModule y HttpClientModule
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private router: Router, private toast: ToastService) {}

  constructor(private router: Router, private http: HttpClient) { }
 

  // ✅ Métodos para los botones de navegación
  onForgotPassword() {
    this.router.navigate(['/password-fg']);
  

  onRegister() {
    this.router.navigate(['/signup']);
  }

  // Navegar a la raíz al hacer click en el logo
  goHome() {
    this.router.navigate(['/']);
  }


      // Redirigimos a la nueva vista Home2
      this.router.navigate(['/home2']);
    } else {
      this.toast.show('Por favor, completa ambos campos para continuar.', 'error');
      
  // Maneja el submit del formulario de login
  onSubmit() {
    this.error = null;
    if (!this.email || !this.password) {
      this.error = 'Por favor completa email y password';
      return;

    }

    this.loading = true;
    const url = `${environment.apiUrl}/v1/auth/login`;
    this.http.post<any>(url, { email: this.email, password: this.password }).subscribe({
      next: (resp) => {
        // Intentar extraer el token de forma flexible
        const token = resp?.token || resp?.accessToken || resp?.access_token || resp?.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        } else {
          // Si no viene token explícito, guardar la respuesta completa (por compatibilidad)
          localStorage.setItem('auth', JSON.stringify(resp));
        }
        this.loading = false;
        // Redirigir a la ruta principal (ajusta según tu app)
        this.router.navigate(['/home2']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err?.error?.message || err?.message || 'Error en login';
        this.loading = false;
      }
    });
  }


}
