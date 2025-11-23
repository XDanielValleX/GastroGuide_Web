import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AlertDialog } from '../../shared/alert/alert';
import { UsersService } from '../../shared/users.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, AlertDialog] // ✅ necesario
})
export class Signup {
  selectedRole: 'STUDENT' | 'CREATOR' = 'STUDENT';
  message: string = '';
  loading: boolean = false;
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient, private router: Router, private usersService: UsersService) {}

  selectRole(role: 'STUDENT' | 'CREATOR') {
    this.selectedRole = role;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onSubmit(form: NgForm) {
    if (!form) {
      return;
    }

    this.message = '';
    if (form.invalid) {
      this.message = 'Por favor completa todos los campos.';
      return;
    }

    const username = (this.username || '').trim();
    const email = (this.email || '').trim();
    const password = this.password || '';
    const confirm = this.confirmPassword || '';

    this.username = username;
    this.email = email;

    if (username.length < 3) {
      this.message = 'El username debe tener al menos 3 caracteres.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
      this.message = 'Ingresa un correo válido (ej. usuario@dominio.com).';
      return;
    }

    if (password !== confirm) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    // Validaciones que el backend está aplicando
    if (password.length < 8 || password.length > 100) {
      this.message = 'La contraseña debe tener entre 8 y 100 caracteres.';
      return;
    }

    const pwdPattern = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-zÑñ\d@$!%*?&.]{8,100}$/;
    if (!pwdPattern.test(password)) {
      this.message = 'La contraseña debe incluir mayúscula, minúscula, número y un caracter especial.';
      return;
    }

    this.loading = true;
    this.message = '';

  // Enviar el payload incluyendo username y rol
  const payload: any = { username, email, password, confirmPassword: confirm, userType: this.selectedRole };
  console.debug('Register payload:', payload);
  this.http.post(`${environment.apiUrl}/api/v1/auth/register`, payload)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
      next: () => {
        this.message = 'Registro exitoso. Redirigiendo al login...';
        // Persistencia mínima local para que el perfil muestre datos y rol
        try {
          localStorage.setItem('user', JSON.stringify({ name: username, email, role: this.selectedRole, roles: [this.selectedRole] }));
          // also register in the local UsersService so dashboards and counts update in-app
          this.usersService.addUser({ name: username, email, createdAt: new Date().toISOString(), role: this.selectedRole, roles: [this.selectedRole] });
        } catch {}
        form.resetForm();
        this.username = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
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
      }
    });
  }

  // ✅ Métodos de navegación
  onAlreadyHaveAnAccount() {
    this.router.navigate(['/login']);
  }
}
