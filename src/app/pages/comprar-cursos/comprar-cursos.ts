import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-comprar-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './comprar-cursos.html',
  styleUrls: ['./comprar-cursos.css']
})
export class ComprarCursosComponent implements OnDestroy {
  cursos: Course[] = [];

  constructor(private courseService: CourseService, private router: Router, private toast: ToastService) {
    this.cursos = this.courseService.getAllCourses();
  }

  agregarAlCarrito(c: Course) {
    const added = this.courseService.addToCart(c);
    if (added) this.toast.show(`Agregado al carrito: ${c.titulo}`, 'success');
    else this.toast.show(`El curso ya está en el carrito`, 'info');
  }

  comprarAhora(c: Course) {
    // redirige al panel de compra (checkout) mostrando el curso seleccionado
    console.log('navegar a checkout', c.id);
    try {
      this.router.navigateByUrl(`/checkout/${c.id}`);
    } catch (e) {
      console.error('error navegando a checkout', e);
    }
  }

  ngOnDestroy(): void {
  }
}
