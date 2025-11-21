
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Statistics } from '../statistics/statistics';
import { CreateReels } from '../create-reels/create-reels';
import { ProfileC } from '../profile-c/profile-c';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReelsService } from '../../shared/reels.service';
import { UsersService } from '../../shared/users.service';
import { CoursesService } from '../../shared/courses.service';
import { Subscription } from 'rxjs';

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

  coursesCount: number = 0;
  usersCount: number = 0;
  reelsCount: number = 0;
  private subs: Subscription[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private reelsService: ReelsService, private usersService: UsersService, private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(map => {
      const noHeader = map.get('noHeader');
      this.showHeader = !(noHeader === '1' || noHeader === 'true');
    });
    // subscribe to counts
    this.subs.push(this.reelsService.reels$.subscribe(list => this.reelsCount = Array.isArray(list) ? list.length : 0));
    this.subs.push(this.usersService.users$.subscribe(list => this.usersCount = Array.isArray(list) ? list.length : 0));
    this.subs.push(this.coursesService.courses$.subscribe(list => this.coursesCount = Array.isArray(list) ? list.length : 0));
    // ensure initial refresh for courses
    try { this.coursesService.refresh(); } catch {}
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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
    // Smooth scroll panel into view after state change
    setTimeout(() => {
      const panel = document.querySelector('.panel-section');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  goTo(route: string) {
    // helper used by clickable grids
    switch (route) {
      case 'courses': this.router.navigate(['/courses']); break;
      case 'signup': this.router.navigate(['/signup']); break;
      case 'reels': this.router.navigate(['/reels']); break;
      default: this.router.navigate(['/']);
    }
  }

  backToDashboard() {
    this.activeSection = 'dashboard';
  }
}
