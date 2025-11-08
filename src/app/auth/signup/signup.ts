import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule] // ✅ necesario
})
export class Signup {
  message: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form) return;

  const formData = new FormData(form);
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();
  const confirm = (formData.get('confirm') || '').toString();

    if (password !== confirm) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    // Validaciones que el backend está aplicando
    if (password.length < 8 || password.length > 100) {
      this.message = 'La contraseña debe tener entre 8 y 100 caracteres.';
      return;
    }

    const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/;
    if (!pwdPattern.test(password)) {
      this.message = 'La contraseña debe incluir mayúscula, minúscula, número y un caracter especial.';
      return;
    }

    this.loading = true;
    this.message = '';

    // Enviar el payload que el backend espera (no enviar 'username' si el backend no lo reconoce)
    const payload = { email, password, confirmPassword: confirm };
    console.debug('Register payload:', payload);
    this.http.post(`${environment.apiUrl}/v1/auth/register`, payload).subscribe({
      next: () => {
        this.message = 'Registro exitoso. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        // Mostrar información útil de error del servidor (si existe)
        if (err?.error) {
          try {
            // err.error puede ser objeto JSON con detalles
            this.message = err.error.message || JSON.stringify(err.error);
          } catch (e) {
            this.message = String(err.error);
          }
        } else {
          this.message = 'Error registrando usuario.';
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ✅ Métodos de navegación
  onAlreadyHaveAnAccount() {
    this.router.navigate(['/login']);
  }
}
