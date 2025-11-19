import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule, FormsModule]
})
export class Profile {

  user = {
    name: "Daniel Valle",
    email: "usuario@gmail.com",
    joined: "Enero 2025",
    role: "Estudiante de Gastronomía",

    image: "assets/profile.jpg",

    // DATOS NUEVOS DEL HTML VIEJO
    courses: 12,
    videos: 45,
    badges: 8,
    recipes: 5,

    bio: "Amante de la cocina internacional 🌎✨. Siempre buscando nuevas técnicas y sabores para mejorar mis habilidades culinarias.",

    achievements: [
      "🍝 Certificado en Cocina Italiana",
      "🍰 Curso de Postres completado en 1 semana",
      "🏅 Insignia de Participación destacada"
    ]
  };

  modoEdicion: boolean = false;

  activarEdicion() {
    this.modoEdicion = true;
  }

  guardarCambios() {
    this.modoEdicion = false;
    // Aquí luego conectas con tu backend
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
    };
    reader.readAsDataURL(file);
  }

}
