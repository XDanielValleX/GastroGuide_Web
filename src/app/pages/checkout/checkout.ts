import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent {
  curso?: Course;

  constructor(private route: ActivatedRoute, private cs: CourseService, private router: Router, private toast: ToastService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.curso = this.cs.getCourseById(id);
    }
  }

  confirmarCompra() {
    if (!this.curso) return;
    // opcional: evitar duplicados
    const already = this.cs.getPurchasesSnapshot().some(c => c.id === this.curso!.id);
    if (already) {
      this.toast.show('Ya compraste este curso anteriormente.', 'info');
      this.router.navigate(['/mis-cursos']);
      return;
    }

    const ok = this.cs.buyCourse(this.curso);
    if (ok) this.toast.show('Compra realizada correctamente.', 'success');
    else this.toast.show('No se pudo realizar la compra (quizá ya compraste el curso).', 'error');
    this.router.navigate(['/mis-cursos']);
  }

  cancelar() {
    this.router.navigate(['/comprar-cursos']);
  }
}
