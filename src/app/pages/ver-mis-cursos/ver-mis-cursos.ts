import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchasedCourse, PurchasedCoursesService } from '../../shared/purchased-courses.service';
import { UserSessionService } from '../../shared/user-session.service';

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
    private router: Router,
    private http: HttpClient,
    private userSession: UserSessionService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios en cursos comprados
    this.subscription = this.purchasedCoursesService.courses$.subscribe(
      courses => {
        this.cursos = courses;
      }
    );

    // Intentar cargar desde el servidor las compras del estudiante
    this.userSession.ensureProfileLoaded().subscribe(profile => {
      const studentId = profile?.id;
      if (studentId) {
        this.fetchPurchasedCourses(String(studentId));
      }
    });
  }

  private fetchPurchasedCourses(studentId: string) {
    const url = `${environment.apiUrl}/api/v1/courses/all/student/${encodeURIComponent(studentId)}`;
    this.http.get<any[]>(url).subscribe({
      next: (list) => {
        if (!Array.isArray(list)) return;
        const mapped: PurchasedCourse[] = list.map(c => ({
          id: c.id,
          title: c.title || c.name || 'Curso',
          description: c.description || (Array.isArray(c.objectives) ? c.objectives.join('. ') : ''),
          image: c.image || c.coverImage || c.thumbnail || '/assets/images/placeholder-course.png',
          instructor: c.creator && typeof c.creator === 'object' ? (c.creator.fullName || c.creator.username) : (c.creator || 'Instructor'),
          price: typeof c.price === 'number' ? c.price : 0,
          discountPrice: typeof c.discountPrice === 'number' ? c.discountPrice : null,
          language: c.language || 'ES',
          purchaseDate: c.publicationDate || c.publication_date || new Date().toISOString(),
          progreso: 0,
          rating: c.averageRating || c.rating || 0,
          modules: Array.isArray(c.modules) ? c.modules : [],
          lessons: Array.isArray(c.modules) ? ([] as any[]).concat(...c.modules.map((m: any) => Array.isArray(m.lessons) ? m.lessons : [])) : []
        }));

        // Añadir/actualizar en el servicio local
        mapped.forEach(mc => this.purchasedCoursesService.addCourse(mc));
        // Actualizar vista inmediata
        this.cursos = this.purchasedCoursesService.getCourses();
      },
      error: (err) => {
        console.error('Error loading purchased courses', err);
      }
    });
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
