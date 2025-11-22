import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';
import { environment } from '../../../environments/environment';

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
  private selectedImageFile: File | null = null;
  private previewUrl: string | null = null;
  private pendingUploadedPath: string | null = null;
  private serverImagePath: string | null = null;
  private readonly defaultAvatar = 'assets/profile.jpg';

  // Estado de validación y comparación
  isValid: boolean = true;
  validation = { birthDate: true, phone: true, name: true };
  private originalEditable = this.pickEditable();
  private userSub?: Subscription;

  constructor(
    private router: Router,
    private userSession: UserSessionService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.applyProfile(this.userSession.snapshot);
    this.userSub = this.userSession.user$.subscribe((profile) => this.applyProfile(profile));
  }

  ngOnDestroy() {
    this.revokePreviewUrl();
    this.userSub?.unsubscribe();
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  async guardarCambios() {
    if (!this.modoEdicion || !this.isValid || !this.hasChanges || this.saving) return;

    const payload = this.pickEditable();
    this.saving = true;
    try {
      const imagePath = await this.ensureAvatarPath();
      payload.image = imagePath;
    } catch (error: any) {
      this.saving = false;
      const message = error?.message || 'No se pudo subir la imagen';
      this.showToast(message);
      return;
    }

    this.userSession.updateProfile(payload).subscribe({
      next: (updated) => {
        this.pendingUploadedPath = null;
        this.selectedImageFile = null;
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
    this.selectedImageFile = file;
    this.pendingUploadedPath = null;
    this.setPreviewFromFile(file);
    event.target.value = '';
    this.runValidation();
  }

  // --- validación y utilidades ---
  onFieldChange() {
    this.runValidation();
  }

  get hasChanges(): boolean {
    if (this.selectedImageFile || this.pendingUploadedPath) {
      return true;
    }
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
      image: this.pendingUploadedPath || this.serverImagePath || image || base.image
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
      this.serverImagePath = null;
      this.user.image = this.buildImageUrl(this.user.image || this.baseProfile().image);
      this.originalEditable = this.pickEditable();
      this.runValidation();
      return;
    }

    const base = this.baseProfile();
    const normalizedName = (profile.name || profile.username || '').trim();
    const mergedAchievements = Array.isArray(profile.achievements) ? profile.achievements : (this.user.achievements || []);
    this.serverImagePath = profile.image || this.pendingUploadedPath || null;

    this.user = {
      ...base,
      ...this.user,
      ...profile,
      image: this.buildImageUrl(profile.image || this.pendingUploadedPath || this.user.image || base.image),
      achievements: mergedAchievements
    };
    this.user.name = normalizedName || this.user.name || profile.email || '';
    this.originalEditable = this.pickEditable();
    this.runValidation();
    this.pendingUploadedPath = null;
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

  private async ensureAvatarPath(): Promise<string> {
    if (this.pendingUploadedPath) {
      return this.pendingUploadedPath;
    }

    if (!this.selectedImageFile) {
      return this.serverImagePath || this.baseProfile().image || this.defaultAvatar;
    }

    const formData = new FormData();
    formData.append('file', this.selectedImageFile);

    const token = this.userSession.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const uploadResponse: any = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/api/v1/files/upload`, formData, { headers })
    );

    const storedPath = uploadResponse?.url || uploadResponse?.path || uploadResponse?.data?.url || uploadResponse?.data?.path;
    if (!storedPath) {
      throw new Error('El backend no devolvió la ruta de la imagen subida');
    }

    this.pendingUploadedPath = storedPath;
    this.user.image = this.buildImageUrl(storedPath);
    this.revokePreviewUrl();
    this.selectedImageFile = null;
    return storedPath;
  }

  private setPreviewFromFile(file: File) {
    this.revokePreviewUrl();
    this.previewUrl = URL.createObjectURL(file);
    this.user.image = this.previewUrl;
  }

  private revokePreviewUrl() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
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
