import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule] // necesario para [(ngModel)]
})
export class Login {
  email = '';
  password = '';

  constructor(private router: Router, private toast: ToastService) {}

  onLogin() {
    // Simulamos una autenticación temporal
    if (this.email.trim() && this.password.trim()) {
      // Guardamos un valor temporal en localStorage
      localStorage.setItem('isLoggedIn', 'true');

      // Redirigimos a la nueva vista Home2
      this.router.navigate(['/home2']);
    } else {
      this.toast.show('Por favor, completa ambos campos para continuar.', 'error');
    }
  }
}
