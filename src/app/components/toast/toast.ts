import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class Toast {
  message: ToastMessage | null = null;

  constructor(private ts: ToastService){
    this.ts.messages$.subscribe(m => this.message = m);
  }
}
