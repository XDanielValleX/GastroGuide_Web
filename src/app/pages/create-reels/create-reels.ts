import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReelsService } from '../../shared/reels.service';

@Component({
  selector: 'app-create-reels',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './create-reels.html',
  styleUrl: './create-reels.css'
})
export class CreateReels {
  title = '';
  author = '';
  src = '';
  fileName = '';
  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  constructor(private reels: ReelsService) {}

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const f = input.files[0];
    this.fileName = f.name;
    // Create object URL for preview/upload simulation
    try { this.src = URL.createObjectURL(f); } catch { this.src = ''; }
  }

  create() {
    if (!this.title.trim() || !this.src.trim()) {
      this.showAlert('Título y video requeridos', 'error');
      return;
    }
    this.reels.addReel({ title: this.title.trim(), author: this.author || 'Autor', src: this.src });
    // reset
    this.title = '';
    this.author = '';
    this.src = '';
    this.fileName = '';
    this.showAlert('Reel creado y añadido al feed', 'success');
  }

  showAlert(message: string, type: 'success' | 'error' = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.alertVisible = true;
    // auto dismiss
    setTimeout(() => this.alertVisible = false, 4200);
  }

  dismissAlert() { this.alertVisible = false; }
}
