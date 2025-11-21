import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

// Importa tus componentes
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,     // para *ngIf, ng-template
    RouterOutlet,     // ✅ necesario para <router-outlet>
    Header,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  currentRoute = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  isIndependentPage(): boolean {
    return (
      this.currentRoute.startsWith('/home2') ||
      this.currentRoute.startsWith('/home3') ||
      this.currentRoute.startsWith('/blog') ||
      this.currentRoute.startsWith('/login') ||
      this.currentRoute.startsWith('/signup') ||
      this.currentRoute.startsWith('/password-fg') ||
      this.currentRoute.startsWith('/password-chg') ||
      this.currentRoute.startsWith('/reels') ||
      this.currentRoute.startsWith('/create-course') ||
      this.currentRoute.startsWith('/profile') ||
      this.currentRoute.startsWith('/profile-creator')
    );
  }
}
