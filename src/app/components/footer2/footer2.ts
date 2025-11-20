import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer2.html',
  styleUrl: './footer2.css'
})
export class Footer2 {
  email = '';
  submitting = false;
  submitted = false;
  year = new Date().getFullYear();

  onSubscribe(ev: Event) {
    ev.preventDefault();
    if (!this.email || this.submitting) return;
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      this.email = '';
      setTimeout(() => (this.submitted = false), 5000);
    }, 1200);
  }
}
