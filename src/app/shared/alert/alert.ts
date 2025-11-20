import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css']
})
export class AlertDialog implements AfterViewInit {
    @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;
    ngAfterViewInit(): void {
      // Enfocar el botón de cierre para accesibilidad (teclado)
      if (this.closeBtn) {
        queueMicrotask(() => this.closeBtn.nativeElement.focus());
      }
    }
  @Input() message: string | null = null;
  @Input() type: 'error' | 'success' | 'info' = 'error';
  @Output() close = new EventEmitter<void>();

  visible = true;
  closing = false;

  get icon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '⚠️';
    }
  }

  onBackdrop() {
    this.closeAlert();
  }

  closeAlert() {
    if (this.closing) return;
    this.closing = true;
    // Esperar fin de animación antes de ocultar y emitir
    setTimeout(() => {
      this.visible = false;
      this.close.emit();
    }, 180); // debe coincidir con duración bubbleOut
  }
}
