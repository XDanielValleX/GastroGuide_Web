import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class Profile implements OnInit, OnDestroy {

  user: UserProfile = this.baseProfile();

  modoEdicion: boolean = false;
  toast: string | null = null;
  saving = false;

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
    this.applyProfile(this.userSession.snapshot);
    this.userSub = this.userSession.user$.subscribe((profile) => this.applyProfile(profile));
    this.userSession.refreshFromApi().subscribe();
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
    this.router.navigateByUrl('/password-chg');
  }

  // --- selector de imagen ---
  openSelector() {
    document.getElementById('fileInput')?.click();
  }

  changeImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.user.image = reader.result as string;
      // Al cambiar imagen, habilitar botón Guardar
      this.runValidation();
    };
    reader.readAsDataURL(file);
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
    const { name, bio, birthDate, phone, gender, address, image } = this.user as UserProfile;
    return {
      name: name || '',
      bio: bio || '',
      birthDate: birthDate || '',
      phone: phone || '',
      gender: gender || '',
      address: address || '',
      image: image || base.image
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
      this.user = { ...this.baseProfile(), ...this.user };
      this.originalEditable = this.pickEditable();
      this.runValidation();
      return;
    }

    const base = this.baseProfile();
    const normalizedName = (profile.name || profile.username || '').trim();
    const mergedAchievements = Array.isArray(profile.achievements) ? profile.achievements : (this.user.achievements || []);

    this.user = {
      ...base,
      ...this.user,
      ...profile,
      image: profile.image || this.user.image || base.image,
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
      image: 'assets/profile.jpg',
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
}
