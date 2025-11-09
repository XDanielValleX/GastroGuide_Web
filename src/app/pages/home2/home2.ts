import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
