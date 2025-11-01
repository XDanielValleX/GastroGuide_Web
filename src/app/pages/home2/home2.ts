import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home2',
  standalone: true,
  templateUrl: './home2.html',
  styleUrls: ['./home2.css'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule]
})
export class Home2 {
  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
    }
  }
}
