
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

interface Course {
  id: string | number;
  title: string;
  instructor?: string;
  description?: string;
  image?: string;
  price?: number;
  discountPrice?: number | null;
  language?: string;
  publishedAt?: string | null;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading: boolean = false;
  error: string | null = null;

  // UI state
  searchTerm: string = '';
  selectedSort: string = 'popular';
  page: number = 1;
  pageSize: number = 12;
  previewCourse: Course | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchCourses();
  }

  private SAMPLE_COURSE: Course = {
    id: 'SAMPLE_TEST',
    title: 'Curso de Demostración Completo',
    instructor: 'Chef Demo',
    description: 'Un curso de prueba con descripción extensa para verificar renderizado. Incluye módulos y lecciones en detalle en la vista de curso individual.',
    image: 'https://via.placeholder.com/640x360.png?text=Demo+Course',
    price: 49.99,
    discountPrice: 19.99,
    language: 'ES',
    publishedAt: new Date().toISOString()
  };

  addSampleCourse(force: boolean = false) {
    const exists = this.courses.some(c => String(c.id) === String(this.SAMPLE_COURSE.id));
    if (exists && !force) {
      return; // evitar duplicados
    }
    if (!exists) {
      this.courses.push({ ...this.SAMPLE_COURSE });
    } else if (force) {
      // reemplazar contenido (por si queremos actualizar datos)
      this.courses = this.courses.map(c => String(c.id) === String(this.SAMPLE_COURSE.id) ? { ...this.SAMPLE_COURSE } : c);
    }
    this.applyFilters();
  }

  fetchCourses() {
    this.loading = true;
    this.error = null;
    const url = `${environment.apiUrl}/api/v1/courses/all`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        // accept different shapes: resp.data || resp.courses || resp
        const list = resp?.data || resp?.courses || resp || [];
        // normalize to Course[]
        this.courses = Array.isArray(list) ? list.map((c: any) => {
          // Extraer el nombre del creador desde diferentes estructuras
          let instructorName = 'Instructor';
          if (c.creator && typeof c.creator === 'object') {
            instructorName = c.creator.name || c.creator.username ||
                           (c.creator.firstName && c.creator.lastName ? `${c.creator.firstName} ${c.creator.lastName}` : c.creator.firstName) ||
                           'Instructor';
          } else if (typeof c.creator === 'string' && c.creator.trim()) {
            instructorName = c.creator;
          } else {
            instructorName = c.instructor || c.author || c.teacher || c.creatorName || 'Instructor';
          }

          return {
            id: c.id ?? c._id ?? c.courseId,
            title: c.title || c.name || 'Curso sin título',
            instructor: instructorName,
            description: c.description || c.summary || '',
            image: c.image || c.coverImage || c.thumbnail || c.imgPortada || '/assets/images/placeholder-course.png',
            price: Number(c.price ?? c.cost ?? 0),
            discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : (c.offerPrice !== undefined ? Number(c.offerPrice) : null),
            language: c.language || c.lang || 'ES',
            publishedAt: c.publishedAt || c.createdAt || c.date || null
          };
        }) : [];

        this.applyFilters();
        // Inyectar curso de prueba si no viene del backend
        this.addSampleCourse(false);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.error = err?.error?.message || err?.message || 'Error cargando cursos';
        this.loading = false;
        // Incluso en error, permitir ver el curso de prueba
        this.addSampleCourse(false);
      }
    });
  }

  applyFilters() {
    const q = this.searchTerm.trim().toLowerCase();
    let list = this.courses.slice();
    if (q) {
      list = list.filter(c => (c.title + ' ' + (c.instructor || '') + ' ' + (c.description || '')).toLowerCase().includes(q));
    }

    switch (this.selectedSort) {
      case 'new':
        // assume id correlates with recency if numeric
        list.sort((a, b) => (b.id as any) - (a.id as any));
        break;
      case 'price_asc':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
          // default: sort by published date (newer first), then by title
          list.sort((a, b) => {
            const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            if (db !== da) return db - da;
            return (a.title || '').localeCompare(b.title || '');
          });
    }

    this.filteredCourses = list;
    this.page = 1;
  }

  get pagedCourses() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize));
  }

  changePage(delta: number) {
    const pages = Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize));
    this.page = Math.min(pages, Math.max(1, this.page + delta));
  }

  enroll(course: Course) {
    // very small UX: check token, redirect to login or to course page
    const token = localStorage.getItem('token') || localStorage.getItem('auth');
    if (!token) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Necesitas iniciar sesión para inscribirte en un curso.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir a Login',
        confirmButtonColor: '#FF6028',
        cancelButtonText: 'Cancelar'
      }).then(r => {
        if (r.isConfirmed) this.router.navigate(['/login']);
      });
      return;
    }

    // Redirect to course detail / placeholder
    this.router.navigate(['/watch', course.id]);
  }

  openPreview(course: Course) {
    this.previewCourse = course;
  }

  closePreview() {
    this.previewCourse = null;
  }

  formatPrice(p: number | undefined) {
    if (p === undefined || p === null) return 'Gratis';
    if (p === 0) return 'Gratis';
    return `$${p.toFixed(2)}`;
  }

  formatDate(d: string | null | undefined) {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return d as string;
    }
  }

  onImgError(event: any) {
    try {
      (event.target as HTMLImageElement).src = '/assets/images/placeholder-course.png';
    } catch (e) {
      // ignore
    }
  }

  goDetail(course: Course) {
    // Detectar si estamos dentro de /home2 para usar ruta anidada y mantener layout
    const insideHome2 = this.router.url.startsWith('/home2');
    const base = insideHome2 ? '/home2/courses' : '/courses';
    this.router.navigate([base, course.id], { state: {
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      description: course.description,
      language: course.language,
      price: course.price,
      discountPrice: course.discountPrice,
      publishedAt: course.publishedAt,
      coverImage: course.image,
      image: course.image,
      objective: course.description // usar descripción como objetivo inicial
    } });
  }
}
