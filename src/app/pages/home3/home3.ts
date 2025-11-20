
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Statistics } from '../statistics/statistics';
import { CreateReels } from '../create-reels/create-reels';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home3',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, RouterModule, Statistics, CreateReels],
  templateUrl: './home3.html',
  styleUrl: './home3.css'
})
export class Home3 implements OnInit {
  // UI state
  activeSection: 'dashboard' | 'create' | 'stats' | 'profile' | 'reels' = 'dashboard';
  showHeader: boolean = true;

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
