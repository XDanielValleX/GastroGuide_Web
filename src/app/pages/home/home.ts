import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  // Hero carousel state
  heroImages: string[] = [
    '/Instructores.jpg',
    '/estudiantes1.jpg',
    '/certificado1.png'
  ];
  currentIndex = 0;
  autoPlayInterval: any;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  startAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    this.autoPlayInterval = setInterval(() => {
      this.nextImage();
    }, 5000); // change every 5s
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.heroImages.length;
    this.restartAutoPlay();
  }

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.heroImages.length) % this.heroImages.length;
    this.restartAutoPlay();
  }

  goToImage(i: number) {
    this.currentIndex = i;
    this.restartAutoPlay();
  }

  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resumeAutoPlay() {
    if (!this.autoPlayInterval) {
      this.startAutoPlay();
    }
  }

  private restartAutoPlay() {
    this.startAutoPlay();
  }

  private isLoggedIn(): boolean {
    // Simple check: token or auth present in localStorage
    return !!localStorage.getItem('token') || !!localStorage.getItem('auth');
  }

  startJourney(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/home2']);
    } else {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Necesitas iniciar sesión para continuar.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir a Login',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#FF6028',
        cancelButtonColor: '#888'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
