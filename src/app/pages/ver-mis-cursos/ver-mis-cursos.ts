import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchasedCourse, PurchasedCoursesService } from '../../shared/purchased-courses.service';

@Component({
  selector: 'app-ver-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-mis-cursos.html',
  styleUrl: './ver-mis-cursos.css'
})
export class VerMisCursosComponent implements OnInit, OnDestroy {
  cursos: PurchasedCourse[] = [];
  private subscription?: Subscription;

  constructor(
    private purchasedCoursesService: PurchasedCoursesService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios en cursos comprados
    this.subscription = this.purchasedCoursesService.courses$.subscribe(
      courses => {
        this.cursos = courses;
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  continuarCurso(curso: PurchasedCourse) {
    // Por ahora solo navega al detalle del curso
    // Más adelante se implementará la vista de reproducción
    this.router.navigate(['/home2/courses', curso.id]);
  }
}
