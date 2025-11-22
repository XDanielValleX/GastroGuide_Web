
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

  fetchCourses() {
    this.loading = true;
    this.error = null;
    const url = `${environment.apiUrl}/api/v1/courses/all`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        // accept different shapes: resp.data || resp.courses || resp
        const list = resp?.data || resp?.courses || resp || [];
        // normalize to Course[]
        this.courses = Array.isArray(list) ? list.map((c: any) => ({
          id: c.id ?? c._id ?? c.courseId,
          title: c.title || c.name || 'Curso sin título',
          instructor: c.instructor || c.author || c.teacher || 'Staff',
          description: c.description || c.summary || '',
          image: c.image || c.thumbnail || '/assets/images/placeholder-course.png',
          price: c.price ?? c.cost ?? 0,
          discountPrice: c.discountPrice ?? c.offerPrice ?? null,
          language: c.language || c.lang || 'ES',
          publishedAt: c.publishedAt || c.createdAt || c.date || null
        })) : [];

        // add a preloaded sample card at the top for visual preview (only if not present)
        const sampleId = 'sample-preview-1';
        const exists = this.courses.some((x: any) => x.id === sampleId);
        if (!exists) {
          this.courses.unshift({
            id: sampleId,
            title: 'Curso: Técnicas esenciales de cocina moderna',
            instructor: 'Chef Maria López',
            description: 'Aprende técnicas profesionales de cocina, desde corte hasta presentación y emplatado moderno.',
            image: '/assets/images/creator-illustration.svg',
            price: 49.99,
            discountPrice: 29.99,
            language: 'ES',
            publishedAt: new Date().toISOString()
          } as any);
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.error = err?.error?.message || err?.message || 'Error cargando cursos';
        // ensure the sample preview card still appears when the API fails
        const sampleId = 'sample-preview-1';
        const exists = this.courses.some((x: any) => x.id === sampleId);
        if (!exists) {
          this.courses.unshift({
            id: sampleId,
            title: 'Curso: Técnicas esenciales de cocina moderna',
            instructor: 'Chef Maria López',
            description: 'Aprende técnicas profesionales de cocina, desde corte hasta presentación y emplatado moderno.',
            image: '/jhon.jpeg',
            price: 49.99,
            discountPrice: 29.99,
            language: 'ES',
            publishedAt: new Date().toISOString()
          } as any);
        }
        this.applyFilters();
        this.loading = false;
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
    const inHome2 = this.router.url.startsWith('/home2');
    const target = inHome2 ? ['/home2/courses', course.id] : ['/courses', course.id];
    this.router.navigate(target, { state: { coverImage: course.image, title: course.title, instructor: course.instructor } });
  }
}
