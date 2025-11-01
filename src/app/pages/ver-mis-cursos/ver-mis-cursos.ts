import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ver-mis-cursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-mis-cursos.html',
  styleUrl: './ver-mis-cursos.css'
})
export class VerMisCursosComponent {
cursos = [
    {
      titulo: 'Cocina Italiana Tradicional',
      progreso: 80,
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      descripcion: 'Aprende a preparar pastas, pizzas y salsas auténticas con chefs expertos.',
      rating: 4.8
    },
    {
      titulo: 'Postres y Repostería Moderna',
      progreso: 50,
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      descripcion: 'Domina técnicas de repostería y crea postres de nivel profesional.',
      rating: 4.6
    },
    {
      titulo: 'Cocina Colombiana de Autor',
      progreso: 25,
      imagen: 'https://images.unsplash.com/photo-1589307000254-0072d41ea6c3?auto=format&fit=crop&w=800&q=80',
      descripcion: 'Explora recetas típicas con un toque contemporáneo y presentación gourmet.',
      rating: 4.9
    }
  ];
}
