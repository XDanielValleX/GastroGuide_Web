import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnDestroy {
  cartCount = 0;
  sub = new Subscription();

  constructor(private cs: CourseService){
    this.sub.add(this.cs.cart$.subscribe(v => this.cartCount = v.length));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}
