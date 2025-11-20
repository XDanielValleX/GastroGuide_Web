import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReelStatsService } from '../../shared/reel-stats.service';
import { ReelsService, ReelItem } from '../../shared/reels.service';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reels.html',
  styleUrl: './reels.css'
})
export class Reels implements OnInit {
  reels: ReelItem[] = [];

  // Índice del reel que se muestra en el feed (estilo TikTok)
  currentIndex = 0;
  // Formulario temporal para agregar manualmente
  showForm = false;
  newReel = { title: '', src: '' };
  // Panel de comentarios
  showComments = false;
  newCommentText = '';

  // Video controls
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  isPlaying = true;
  isMuted = false;
  currentTime = 0;
  duration = 0;
  seekValue = 0;

  // Para futura paginación/infinite scroll
  isLoadingMore = false;

  get current(): ReelItem | null {
    return this.reels[this.currentIndex] || null;
  }

  constructor(private stats: ReelStatsService, private reelsSvc: ReelsService) {
    this.reelsSvc.reels$.subscribe(list => this.reels = list);
  }

  ngOnInit(): void {
    if (this.current) this.stats.registerView(this.current.id);
  }

  next(): void {
    if (this.currentIndex < this.reels.length - 1) {
      this.currentIndex++;
      if (this.current) this.stats.registerView(this.current.id);
    } else {
      // TODO: Trigger loadMore() cuando se alcance el final y backend esté listo
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      if (this.current) this.stats.registerView(this.current.id);
    }
  }

  toggleLike(reel: ReelItem): void {
    reel.liked = !reel.liked;
    reel.likes += reel.liked ? 1 : -1;
    if (reel.liked) this.stats.registerLike(reel.id);
  }

  toggleCommentsPanel(): void {
    this.showComments = !this.showComments;
  }

  // Video control methods
  togglePlay(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  toggleMute(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  onVideoTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.currentTime = video.currentTime;
    this.duration = video.duration || 0;
    this.seekValue = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoPlayer?.nativeElement;
    if (!video || !this.duration) return;
    const newTime = (parseFloat(input.value) / 100) * this.duration;
    video.currentTime = newTime;
    this.currentTime = newTime;
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  submitComment(reel: ReelItem): void {
    const text = this.newCommentText.trim();
    if (!text) return;
    if (!reel.commentList) reel.commentList = [];
    reel.commentList.push({ text, createdAt: new Date().toISOString() });
    reel.comments = reel.commentList.length;
    this.stats.registerComment(reel.id);
    this.newCommentText = '';
  }

  addReel(): void {
    if (!this.newReel.title.trim() || !this.newReel.src.trim()) {
      alert('Título y URL del video requeridos');
      return;
    }
    this.reelsSvc.addReel({ title: this.newReel.title.trim(), author: 'NuevoAutor', src: this.newReel.src.trim(), thumbnail: undefined });
    this.currentIndex = 0; // Mostrar el nuevo primero
    if (this.current) this.stats.registerView(this.current.id);
    this.newReel.title = '';
    this.newReel.src = '';
    this.showForm = false;
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
        createdAt: new Date().toISOString(),
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
