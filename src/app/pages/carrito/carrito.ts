import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class CarritoComponent implements OnDestroy {
  items: any[] = [];
  sub = new Subscription();

  constructor(private cs: CourseService, private toast: ToastService, private router: Router) {
    this.sub.add(this.cs.cart$.subscribe(v => this.items = v));
  }

  get total(): number {
    return this.items.reduce((s, i) => s + (i.precio || 0), 0);
  }

  comprar() {
    this.cs.buyCart();
    this.toast.show('Compra realizada. Revisa Mis Cursos.', 'success');
    this.router.navigate(['/mis-cursos']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
