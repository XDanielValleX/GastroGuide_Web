import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-password-fg',
  standalone: true,
  templateUrl: './password-fg.html',
  styleUrls: ['./password-fg.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PasswordFG {
  constructor(private router: Router) {}

  onReturnToLogin() {
    this.router.navigate(['/login']);
  }
}
