import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, FormsModule]
})
export class Profile implements OnInit, OnDestroy {

  user: UserProfile = this.baseProfile();

  modoEdicion: boolean = false;
  toast: string | null = null;
  saving = false;
  private serverImagePath: string | null = null;
  private readonly defaultAvatar = 'assets/profile.svg';

  // Estado de validación y comparación
  isValid: boolean = true;
  validation = { birthDate: true, phone: true, name: true };
  private originalEditable = this.pickEditable();
  private userSub?: Subscription;

  constructor(
    private router: Router,
    private userSession: UserSessionService
  ) {}

  ngOnInit() {
    const role = this.userSession.getRole();
    if (role === 'CREATOR') {
      this.router.navigateByUrl('/profile-c');
      return;
    }
    this.applyProfile(this.userSession.snapshot);
    this.userSub = this.userSession.user$.subscribe((profile) => this.applyProfile(profile));
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  guardarCambios() {
    if (!this.modoEdicion || !this.isValid || !this.hasChanges || this.saving) return;

    const payload = this.pickEditable();
    payload.avatar = this.defaultAvatar;
    payload.image = this.defaultAvatar;
    this.saving = true;

    this.userSession.updateProfile(payload).subscribe({
      next: (updated) => {
        this.applyProfile(updated);
        this.originalEditable = this.pickEditable();
        this.modoEdicion = false;
        this.saving = false;
        this.showToast('Cambios guardados correctamente');
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.message || err?.message || 'No se pudo guardar los cambios';
        this.showToast(message);
      }
    });
  }

  irAlInicio() {
    this.router.navigateByUrl('/home2');
  }

  irACambiarPassword() {
    this.router.navigateByUrl('/password-fg');
  }

  handleImageError(event: Event) {
    const img = event?.target as HTMLImageElement | null;
    if (img) {
      img.src = this.defaultAvatar;
    }
  }

  // --- validación y utilidades ---
  onFieldChange() {
    this.runValidation();
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.pickEditable()) !== JSON.stringify(this.originalEditable);
  }

  private pickEditable() {
    const base = this.baseProfile();
    const { name, bio, birthDate, phone, gender, address } = this.user as UserProfile;
    const avatarSource = this.defaultAvatar;
    return {
      name: name || '',
      bio: bio || '',
      birthDate: birthDate || '',
      phone: phone || '',
      gender: gender || '',
      address: address || '',
      image: avatarSource,
      avatar: avatarSource
    };
  }

  private runValidation() {
    const birthDateValue = this.user.birthDate;
    const d = birthDateValue ? new Date(birthDateValue) : null;
    this.validation.birthDate = !birthDateValue || (d !== null && !isNaN(d.getTime()));
    const digits = (this.user.phone || '').replace(/\D/g, '');
    this.validation.phone = digits.length === 0 || digits.length >= 9;
    this.validation.name = (this.user.name || '').trim().length >= 3;
    this.isValid = Object.values(this.validation).every(Boolean);
  }

  private showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = null), 2500);
  }

  private applyProfile(profile: UserProfile | null | undefined) {
    if (!profile) {
      const base = this.baseProfile();
      this.user = { ...base, ...this.user };
      this.serverImagePath = null;
      this.user.avatar = base.avatar;
      this.user.image = this.buildImageUrl(this.user.avatar || base.image);
      this.originalEditable = this.pickEditable();
      this.runValidation();
      return;
    }

    const base = this.baseProfile();
    const normalizedName = (profile.name || profile.username || '').trim();
    const mergedAchievements = Array.isArray(profile.achievements) ? profile.achievements : (this.user.achievements || []);
    const avatarPath = this.defaultAvatar;
    const storedAvatar = this.defaultAvatar;
    this.serverImagePath = storedAvatar;

    this.user = {
      ...base,
      ...this.user,
      ...profile,
      avatar: avatarPath,
      image: this.buildImageUrl(avatarPath || base.image),
      achievements: mergedAchievements
    };
    this.user.name = normalizedName || this.user.name || profile.email || '';
    this.originalEditable = this.pickEditable();
    this.runValidation();
  }

  private baseProfile(): UserProfile {
    return {
      name: '',
      username: '',
      email: '',
      role: '',
      image: this.defaultAvatar,
      avatar: this.defaultAvatar,
      joined: '',
      courses: 0,
      videos: 0,
      badges: 0,
      recipes: 0,
      achievements: [],
      bio: '',
      birthDate: '',
      phone: '',
      gender: '',
      address: ''
    };
  }

  private buildImageUrl(path?: string | null): string {
    const fallback = this.baseProfile().image || this.defaultAvatar;
    const value = path || fallback;
    if (!value) {
      return fallback;
    }
    if (/^(data:|https?:|blob:|assets\/)/i.test(value)) {
      return value;
    }
    if (value.startsWith('/')) {
      return `${environment.apiUrl}${value}`;
    }
    return `${environment.apiUrl}/${value}`;
  }
}
