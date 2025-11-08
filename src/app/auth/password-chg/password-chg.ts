import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-chg',
  standalone: true,
  templateUrl: './password-chg.html',
  styleUrls: ['./password-chg.css'],
  imports: [CommonModule, FormsModule]
})
export class PasswordCHG {
  constructor(private router: Router) {} // Inyección del router

  // Métodos de navegación
  onReturnToLogin() {
    this.router.navigate(['/login']);
  }
}
