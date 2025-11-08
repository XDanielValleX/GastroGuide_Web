import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './curso-detalle.html',
  styleUrls: ['./curso-detalle.css']
})
export class CursoDetalleComponent {
  curso?: Course;

  constructor(private route: ActivatedRoute, private cs: CourseService, private toast: ToastService, private router: Router) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.curso = this.cs.getCourseById(id);
    }
  }

  agregar() {
    if (this.curso) {
      const ok = this.cs.addToCart(this.curso);
      if (ok) this.toast.show('Agregado al carrito', 'success');
      else this.toast.show('El curso ya está en el carrito', 'info');
    }
  }

  comprarAhora() {
    if (this.curso) {
      const ok = this.cs.buyCourse(this.curso);
      if (ok) this.toast.show('Compra realizada. Revisa Mis Cursos.', 'success');
      else this.toast.show('No se pudo comprar (ya adquirido).', 'info');
      this.router.navigate(['/mis-cursos']);
    }
  }
}
