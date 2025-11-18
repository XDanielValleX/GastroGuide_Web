import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reels.html',
  styleUrl: './reels.css'
})
export class Reels {
  // TODO: Replace manual in-memory reels with data fetched via a ReelsService from backend.
  // This will be populated by reels created/subidos en la otra vista de creación.
  reels: Reel[] = [
    {
      id: 1,
      title: 'Introducción a la Plataforma',
      author: 'GastroGuide',
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://placehold.co/720x1280/FF6028/FFFFFF?text=Intro',
      duration: 10,
      createdAt: new Date(),
      likes: 120,
      comments: 14,
      saves: 5,
      shares: 2,
      liked: false
    },
    {
      id: 2,
      title: 'Tips de Estudio Rápidos',
      author: 'ChefPro',
      src: 'https://www.w3schools.com/html/movie.mp4',
      thumbnail: 'https://placehold.co/720x1280/FB8C71/FFFFFF?text=Tips',
      duration: 8,
      createdAt: new Date(),
      likes: 506,
      comments: 102,
      saves: 46,
      shares: 12,
      liked: true
    },
    {
      id: 3,
      title: 'Cuchillos y Seguridad',
      author: 'ProCocina',
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://placehold.co/720x1280/EDEEE6/333?text=Cuchillos',
      duration: 15,
      createdAt: new Date(),
      likes: 92,
      comments: 8,
      saves: 30,
      shares: 4,
      liked: false
    }
  ];

  // Índice del reel que se muestra en el feed (estilo TikTok)
  currentIndex = 0;
  // Formulario temporal para agregar manualmente
  showForm = false;
  newReel = { title: '', src: '' };

  // Para futura paginación/infinite scroll
  isLoadingMore = false;

  get current(): Reel | null {
    return this.reels[this.currentIndex] || null;
  }

  next(): void {
    if (this.currentIndex < this.reels.length - 1) {
      this.currentIndex++;
    } else {
      // TODO: Trigger loadMore() cuando se alcance el final y backend esté listo
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  toggleLike(reel: Reel): void {
    reel.liked = !reel.liked;
    reel.likes += reel.liked ? 1 : -1;
  }

  addReel(): void {
    if (!this.newReel.title.trim() || !this.newReel.src.trim()) {
      alert('Título y URL del video requeridos');
      return;
    }
    const nextId = this.reels.length ? Math.max(...this.reels.map(r => r.id)) + 1 : 1;
    this.reels.unshift({
      id: nextId,
      title: this.newReel.title.trim(),
      author: 'NuevoAutor',
      src: this.newReel.src.trim(),
      thumbnail: 'https://placehold.co/720x1280/EEE0C6/333?text=Nuevo',
      duration: undefined,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      liked: false
    });
    this.currentIndex = 0; // Mostrar el nuevo primero
    this.newReel.title = '';
    this.newReel.src = '';
    this.showForm = false;
    // TODO: Persistir via servicio backend cuando esté disponible.
  }

  loadMore(): void {
    // TODO: Llamar servicio backend para traer más reels.
    this.isLoadingMore = true;
    setTimeout(() => {
      // Simulación agregar uno
      const id = this.reels.length + 1;
      this.reels.push({
        id,
        title: 'Reel extra #' + id,
        author: 'AutoLoad',
        src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://placehold.co/720x1280/FF6028/FFFFFF?text=+'+id,
        duration: 12,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0,
        liked: false
      });
      this.isLoadingMore = false;
    }, 800);
  }

  // Navegación con teclado estilo feed
  @HostListener('document:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') { this.prev(); }
    else if (e.key === 'ArrowDown') { this.next(); }
  }

  // Navegación con rueda / scroll (vertical) - feed
  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent): void {
    if (Math.abs(e.deltaY) < 25) return;
    if (e.deltaY > 0) this.next(); else this.prev();
  }

  // TODO: Integrar eventos (like, comentar, guardar, compartir) con backend.
}

interface Reel {
  id: number;
  title: string;
  author: string;
  src: string;
  thumbnail?: string;
  duration?: number;
  createdAt?: Date;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  liked: boolean;
}
