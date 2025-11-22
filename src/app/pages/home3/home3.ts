
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Statistics } from '../statistics/statistics';
import { CreateReels } from '../create-reels/create-reels';
import { ProfileC } from '../profile-c/profile-c';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home3',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, RouterModule, Statistics, CreateReels, ProfileC],
  templateUrl: './home3.html',
  styleUrl: './home3.css'
})
export class Home3 implements OnInit {
  // UI state
  activeSection: 'dashboard' | 'create' | 'stats' | 'profile' | 'reels' = 'dashboard';
  showHeader: boolean = true;
  // Dashboard preview counters (evitan error de propiedades inexistentes en la plantilla)
  coursesCount: number = 0;
  reelsCount: number = 0;
  usersCount: number = 0;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(map => {
      const noHeader = map.get('noHeader');
      this.showHeader = !(noHeader === '1' || noHeader === 'true');
    });
  }

  isActive(section: 'dashboard' | 'create' | 'stats' | 'profile' | 'reels') {
    return this.activeSection === section;
  }

  open(section: Home3['activeSection']) {
    if (section === 'create') {
      this.router.navigate(['/create-course'], { queryParams: { from: 'home3' } });
      return;
    }
    this.activeSection = section;
    // For now navigate to dedicated routes for each action if available
    switch (section) {
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

    // Smooth scroll panel into view after state change
    setTimeout(() => {
      const panel = document.querySelector('.panel-section');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  backToDashboard() {
    this.activeSection = 'dashboard';
  }

  goBackToHome2() {
    this.router.navigate(['/home2']);
  }

  // Navegación rápida desde las tarjetas de vista previa
  goTo(dest: 'courses' | 'reels' | 'signup') {
    switch (dest) {
      case 'courses':
        this.router.navigate(['/courses']);
        break;
      case 'reels':
        // Si queremos mantenernos dentro del panel, podemos activar sección reels
        // this.open('reels');
        this.router.navigate(['/reels']);
        break;
      case 'signup':
        this.router.navigate(['/signup']);
        break;
    }
  }
}
