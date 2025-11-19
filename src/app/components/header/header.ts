import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(private router: Router) {}

  get showHeader(): boolean {
    const url = this.router?.url || '';
    // Ocultar en rutas de dashboard y cuando venga con ?noHeader=1
    return !(url.startsWith('/home2') || url.includes('noHeader=1'));
  }
}
