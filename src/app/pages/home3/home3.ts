
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home3',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home3.html',
  styleUrl: './home3.css'
})
export class Home3 {
  // UI state
  activeSection: 'dashboard' | 'create' | 'stats' | 'profile' | 'reels' = 'dashboard';
  constructor(private router: Router) {}

  open(section: Home3['activeSection']) {
    this.activeSection = section;
    // For now navigate to dedicated routes for each action if available
    switch (section) {
      case 'create':
        // if you have a create-course route, uncomment
        // this.router.navigate(['/courses/create']);
        break;
      case 'stats':
        // this.router.navigate(['/creator/stats']);
        break;
      case 'profile':
        // this.router.navigate(['/creator/profile']);
        break;
      case 'reels':
        // this.router.navigate(['/creator/reels']);
        break;
    }
  }

  backToDashboard() {
    this.activeSection = 'dashboard';
  }
}
