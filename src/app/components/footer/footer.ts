
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  // Footer component: navigation handled via routerLink in the template.
  constructor(private router: Router) {}

  get showFooter(): boolean {
    const url = this.router?.url || '';
    return !(url.startsWith('/home2') || url.includes('noHeader=1'));
  }
}
