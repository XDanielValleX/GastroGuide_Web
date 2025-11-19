import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home2',
  standalone: true,
  templateUrl: './home2.html',
  styleUrls: ['./home2.css'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, HttpClientModule]
})
export class Home2 {
  searchQuery = '';
  user: { name: string; image: string } = { name: 'Daniel Valle', image: 'assets/profile.jpg' };
  loggingOut = false;

  constructor(private router: Router, private http: HttpClient) {
    try {
      const cached = localStorage.getItem('user');
      if (cached) this.user = JSON.parse(cached);
    } catch {}
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
    }
  }

  onLogout() {
    if (this.loggingOut) return;
    this.loggingOut = true;

    const token = this.getStoredToken();
    if (!token) {
      this.finishLogout();
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${environment.apiUrl}/api/v1/auth/logout`;
    this.http.post(url, {}, { headers }).subscribe({
      next: () => this.finishLogout(),
      error: (err) => {
        console.warn('Logout failed, clearing session locally.', err);
        this.finishLogout();
      }
    });
  }

  private getStoredToken(): string | null {
    const token = localStorage.getItem('token');
    if (token) return token;
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed?.token || parsed?.accessToken || parsed?.access_token || parsed?.data?.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private finishLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch {}
    this.loggingOut = false;
    this.router.navigateByUrl('/login');
  }
}
