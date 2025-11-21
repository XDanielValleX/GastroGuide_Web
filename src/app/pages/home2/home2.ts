import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Footer2 } from '../../components/footer2/footer2';
import { Header2 } from '../../components/header2/header2';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';

interface HeaderUser {
  name?: string;
  username?: string;
  email?: string;
  image: string;
}

@Component({
  selector: 'app-home2',
  standalone: true,
  templateUrl: './home2.html',
  styleUrls: ['./home2.css'],
  imports: [CommonModule, RouterOutlet, FormsModule, HttpClientModule, Footer2, Header2]
})
export class Home2 implements OnInit, OnDestroy {
  searchQuery = '';
  private readonly defaultUser: HeaderUser = { name: '', username: '', email: '', image: 'assets/profile.jpg' };
  user: HeaderUser = { ...this.defaultUser };
  canCreate = false;
  loggingOut = false;
  private userSub?: Subscription;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userSession: UserSessionService
  ) {
    const snapshot = this.userSession.snapshot;
    this.user = this.mapUser(snapshot);
    this.updateCapabilities(snapshot);
  }

  ngOnInit() {
    this.userSub = this.userSession.user$.subscribe((profile) => {
      this.user = this.mapUser(profile);
      this.updateCapabilities(profile);
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  onSearch(query?: string) {
    const q = (query !== undefined && query !== null) ? String(query) : this.searchQuery;
    if (typeof q === 'string' && q.trim()) {
      this.searchQuery = q;
      console.log('Buscando:', this.searchQuery);
    }
  }

  onLogout() {
    if (this.loggingOut) return;
    this.loggingOut = true;

    const token = this.userSession.getToken();
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

  private finishLogout() {
    this.userSession.clearSession();
    this.loggingOut = false;
    this.router.navigateByUrl('/login');
  }

  private mapUser(profile: UserProfile | null | undefined): HeaderUser {
    if (!profile) {
      return { ...this.defaultUser };
    }
    const displayName = profile.name || profile.username || this.defaultUser.name;
    return {
      name: displayName,
      username: profile.username,
      email: profile.email,
      image: this.resolveAvatar(profile.image)
    };
  }

  private updateCapabilities(profile: UserProfile | null | undefined) {
    const role = this.userSession.getRole(profile ?? null);
    this.canCreate = role === 'CREATOR';
  }

  private resolveAvatar(path?: string | null): string {
    const fallback = this.defaultUser.image;
    if (!path) {
      return fallback;
    }
    if (/^(data:|https?:|blob:|assets\/)/i.test(path)) {
      return path;
    }
    if (path.startsWith('/')) {
      return `${environment.apiUrl}${path}`;
    }
    return `${environment.apiUrl}/${path}`;
  }
}
