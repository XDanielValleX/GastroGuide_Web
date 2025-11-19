import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class Profile implements OnInit {

  user = {
    name: "Daniel Valle",
    email: "usuario@gmail.com",
    joined: "Enero 2025",
    role: "Usuario",

    image: "assets/profile.jpg",

    // DATOS NUEVOS DEL HTML VIEJO
    courses: 12,
    videos: 45,
    badges: 8,
    recipes: 5,

    bio: "Amante de la cocina internacional 🌎✨. Siempre buscando nuevas técnicas y sabores para mejorar mis habilidades culinarias.",

    // Datos personales editables
    birthDate: "2000-01-01",
    phone: "+51 999 999 999",
    gender: "Masculino",
    address: "Av. Siempre Viva 123",

    achievements: [
      "🍝 Certificado en Cocina Italiana",
      "🍰 Curso de Postres completado en 1 semana",
      "🏅 Insignia de Participación destacada"
    ]
  };

  modoEdicion: boolean = false;
  toast: string | null = null;

  // Estado de validación y comparación
  isValid: boolean = true;
  validation = { birthDate: true, phone: true, name: true };
  private originalEditable = this.pickEditable();

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Cargar datos persistidos (incluida la imagen) si existen
    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        this.user = JSON.parse(cached);
        this.originalEditable = this.pickEditable();
      }
    } catch {}
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  guardarCambios() {
    if (!this.modoEdicion || !this.isValid || !this.hasChanges) return;

    const payload = this.pickEditable();
    const url = `${environment.apiUrl}/users/me`;
    this.http.put(url, payload).subscribe({
      next: () => {
        this.originalEditable = { ...payload };
        try { localStorage.setItem('user', JSON.stringify({ ...this.user, ...payload })); } catch {}
        this.modoEdicion = false;
        this.showToast('Cambios guardados correctamente');
      },
      error: () => {
        // Simulación si el backend aún no está listo
        this.originalEditable = { ...payload };
        try { localStorage.setItem('user', JSON.stringify({ ...this.user, ...payload })); } catch {}
        this.modoEdicion = false;
        this.showToast('Guardado local simulado. Configura el endpoint cuando esté listo.');
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
    const { name, bio, birthDate, phone, gender, address, image } = this.user as any;
    return { name, bio, birthDate, phone, gender, address, image };
  }

  private runValidation() {
    const d = new Date(this.user.birthDate);
    this.validation.birthDate = !isNaN(d.getTime());
    const digits = (this.user.phone || '').replace(/\D/g, '');
    this.validation.phone = digits.length >= 9;
    this.validation.name = (this.user.name || '').trim().length >= 3;
    this.isValid = Object.values(this.validation).every(Boolean);
  }

  private showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = null), 2500);
  }
}
