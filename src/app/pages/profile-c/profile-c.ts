import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';
import { environment } from '../../../environments/environment';

interface CreatorProfileData {
  name: string;
  username: string;
  bio: string;
  categories: string[];
  avatarUrl: string | null;
  followers: number;
  courses: number;
  earnings: number; // mensual estimado
}

@Component({
  selector: 'app-profile-c',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-c.html',
  styleUrl: './profile-c.css'
})
export class ProfileC implements OnInit, OnDestroy {
  private readonly defaultAvatar = 'assets/profile.svg';
  data: CreatorProfileData = this.buildDefaultData();

  editingAvatar = false;
  editingInfo = false;
  tempName = this.data.name;
  tempUsername = this.data.username;
  tempBio = this.data.bio;
  tempCategories = [...this.data.categories];
  newCategory = '';
  private userSub?: Subscription;

  constructor(private readonly userSession: UserSessionService, private readonly router: Router) {}

  ngOnInit() {
    const role = this.userSession.getRole();
    if (role !== 'CREATOR') {
      this.router.navigateByUrl('/profile');
      return;
    }
    this.applyProfile(this.userSession.snapshot);
    this.userSub = this.userSession.user$.subscribe((profile) => this.applyProfile(profile));
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  goBack() {
    this.router.navigateByUrl('/home2');
  }

  toggleAvatarEdit() {
    this.editingAvatar = !this.editingAvatar;
  }

  toggleInfoEdit() {
    if (!this.editingInfo) {
      this.syncTempFields();
    }
    this.editingInfo = !this.editingInfo;
  }

  addCategory() {
    const c = this.newCategory.trim();
    if (c && !this.tempCategories.includes(c)) {
      this.tempCategories.push(c);
    }
    this.newCategory = '';
  }

  removeCategory(cat: string) {
    this.tempCategories = this.tempCategories.filter(c => c !== cat);
  }

  saveInfo() {
    const normalizedCategories = this.tempCategories
      .map((c) => c.trim())
      .filter((c, idx, arr) => !!c && arr.indexOf(c) === idx);
    this.data = {
      ...this.data,
      name: this.tempName.trim() || this.data.name,
      username: this.tempUsername.trim() || this.data.username,
      bio: this.tempBio.trim(),
      categories: normalizedCategories
    };
    this.editingInfo = false;
    this.syncTempFields();
    this.userSession
      .updateProfile({
        name: this.data.name,
        username: this.data.username,
        bio: this.data.bio,
        categories: this.data.categories
      })
      .subscribe();
  }

  cancelInfo() {
    this.editingInfo = false;
    this.syncTempFields();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.data.avatarUrl = reader.result as string;
        this.editingAvatar = false;
        this.persistAvatar(this.data.avatarUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.data.avatarUrl = null;
    this.editingAvatar = false;
    this.persistAvatar(null);
  }

  private syncTempFields() {
    this.tempName = this.data.name;
    this.tempUsername = this.data.username;
    this.tempBio = this.data.bio;
    this.tempCategories = [...this.data.categories];
  }

  private applyProfile(profile: UserProfile | null | undefined) {
    const base = this.buildDefaultData();
    if (!profile) {
      this.data = { ...base };
      this.syncTempFields();
      return;
    }

    const avatarPath = profile.avatar || profile.image || this.data.avatarUrl || base.avatarUrl;
    const categories = Array.isArray((profile as any).categories)
      ? ((profile as any).categories as string[]).filter((c) => typeof c === 'string' && c.trim().length)
      : this.data.categories.length
        ? this.data.categories
        : base.categories;

    this.data = {
      ...this.data,
      name: profile.name || profile.username || base.name,
      username: profile.username || profile.email?.split('@')[0] || base.username,
      bio: profile.bio || base.bio,
      categories,
      avatarUrl: this.resolveAvatar(avatarPath),
      followers: typeof (profile as any).followers === 'number' ? (profile as any).followers : this.data.followers,
      courses: typeof profile.courses === 'number' ? profile.courses : this.data.courses,
      earnings: typeof (profile as any).earnings === 'number' ? (profile as any).earnings : this.data.earnings
    };
    this.syncTempFields();
  }

  private buildDefaultData(): CreatorProfileData {
    return {
      name: 'Creador GastroGuide',
      username: 'creator',
      bio: 'Actualiza tu biografía para contarle al mundo qué ofreces.',
      categories: ['Cocina saludable', 'Postres'],
      avatarUrl: null,
      followers: 0,
      courses: 0,
      earnings: 0
    };
  }

  private resolveAvatar(path?: string | null): string | null {
    if (!path) {
      return null;
    }
    if (/^(data:|https?:|blob:|assets\/)/i.test(path)) {
      return path;
    }
    if (path.startsWith('/')) {
      return `${environment.apiUrl}${path}`;
    }
    return `${environment.apiUrl}/${path}`;
  }

  private persistAvatar(value: string | null) {
    const payload: Partial<UserProfile> = value
      ? { avatar: value, image: value }
      : { avatar: undefined, image: undefined };
    this.userSession.updateProfile(payload).subscribe();
  }
}
