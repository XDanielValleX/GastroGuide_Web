import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CoursesService, CourseItem } from '../../shared/courses.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface LessonItem {
  id: string | number;
  title: string;
  content: string;
}

interface ModuleItem {
  id: string | number;
  title: string;
  lessons: LessonItem[];
}

interface CourseDetail {
  id: string | number;
  title: string;
  instructor?: string;      // creador
  description?: string;     // descripción
  language?: string;        // idioma
  price?: number;           // precio
  discountPrice?: number | null;
  publishedAt?: string | null; // última actualización / fecha
  coverImage?: string;      // imgPortada
  objective?: string;       // objetivo
  modules?: ModuleItem[];   // módulos con lecciones
}

@Component({
  selector: 'app-detail-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail-courses.html',
  styleUrl: './detail-courses.css'
})
export class DetailCourses {
  course: CourseDetail | null = null;
  expanded: Set<string | number> = new Set();
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private coursesSvc: CoursesService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.error = 'Curso no especificado';
      return;
    }
    // Prefill from navigation state for faster image/title display
    const state: any = (history && history.state) ? history.state : {};
    if (state.coverImage || state.title) {
      this.course = {
        id,
        title: state.title || 'Cargando…',
        instructor: state.instructor || 'Instructor',
        description: '',
        language: 'ES',
        price: 0,
        discountPrice: null,
        publishedAt: null,
        coverImage: state.coverImage,
        objective: undefined,
        modules: []
      };
    }
    // try to locate in service (only has id+title minimal)
    const sub = this.coursesSvc.courses$.subscribe(list => {
      const found = list.find(c => String(c.id) === String(id));
      if (found) {
        // fetch extended data (simulate, since API shape unknown). We'll call API single endpoint; fallback to sample fields.
        this.fetchDetail(found.id, found.title);
      } else if (id === 'sample-preview-1') {
        this.applySample();
      }
    });
    setTimeout(() => sub.unsubscribe(), 4000); // auto-unsubscribe after initial attempts
    // attempt direct fetch (will enrich prefilled course)
    this.fetchDetail(id, this.course?.title || 'Curso');
  }

  fetchDetail(id: string | number, titleFallback: string) {
    const url = `${environment.apiUrl}/api/v1/courses/${id}`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        const c = resp?.data || resp?.course || resp;
        if (!c || typeof c !== 'object') { this.applySample(titleFallback); return; }
        this.course = {
          id: c.id ?? c._id ?? id,
          title: c.title || c.name || titleFallback,
          instructor: c.instructor || c.author || c.teacher || 'Instructor desconocido',
            description: c.description || c.summary || '',
          language: c.language || c.lang || 'ES',
          price: c.price ?? c.cost ?? 0,
          discountPrice: c.discountPrice ?? c.offerPrice ?? null,
          publishedAt: c.publishedAt || c.updatedAt || c.createdAt || null,
          coverImage: c.coverImage || c.image || c.thumbnail || this.course?.coverImage || '/assets/images/placeholder-course.png',
          objective: c.objective || c.goal || c.meta?.objective || 'Aprender habilidades clave del tema.',
          modules: Array.isArray(c.modules) ? c.modules.map((m: any, i: number) => ({
            id: m.id ?? m._id ?? m.moduleId ?? `mod-${i+1}`,
            title: m.title || m.name || `Módulo ${i+1}`,
            lessons: Array.isArray(m.lessons) ? m.lessons.map((l: any, j: number) => ({
              id: l.id ?? l._id ?? l.lessonId ?? `l-${i+1}-${j+1}`,
              title: l.title || l.name || `Lección ${j+1}`,
              content: l.content || l.body || l.text || 'Contenido no disponible.'
            })) : []
          })) : this.sampleModules()
        };
        // limitar a un solo módulo
        if (this.course.modules && this.course.modules.length > 1) {
          this.course.modules = [this.course.modules[0]];
        }
        this.loading = false;
      },
      error: () => {
        // fallback to sample
        if (String(id) === 'sample-preview-1') this.applySample(); else this.applySample(titleFallback);
      }
    });
  }

  applySample(title?: string) {
    this.course = {
      id: 'sample-preview-1',
      title: title || 'Curso: Técnicas esenciales de cocina moderna',
      instructor: 'Chef Maria López',
      description: 'Aprende técnicas profesionales de cocina, desde corte hasta presentación y emplatado moderno.',
      language: 'ES',
      price: 49.99,
      discountPrice: 29.99,
      publishedAt: new Date().toISOString(),
      coverImage: '/assets/images/creator-illustration.svg',
      objective: 'Dominar técnicas básicas y modernas de cocina profesional.',
      modules: this.sampleModules()
    };
    // limitar a un solo módulo
    if (this.course.modules && this.course.modules.length > 1) {
      this.course.modules = [this.course.modules[0]];
    }
    this.loading = false;
    this.error = null;
  }

  formatDate(d: string | null | undefined) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }); } catch { return d as string; }
  }

  sampleModules(): ModuleItem[] {
    return [
      {
        id: 'mod-1',
        title: 'Fundamentos y Herramientas',
        lessons: [
          { id: 'l-1-1', title: 'Introducción a la cocina profesional', content: 'Visión general de estaciones, mise en place y organización.' },
          { id: 'l-1-2', title: 'Herramientas esenciales', content: 'Cuchillos, utensilios clave y su mantenimiento básico.' }
        ]
      },
      {
        id: 'mod-2',
        title: 'Técnicas de Corte',
        lessons: [
          { id: 'l-2-1', title: 'Corte en juliana', content: 'Pasos y práctica segura para lograr tiras uniformes.' },
          { id: 'l-2-2', title: 'Brunoise y mirepoix', content: 'Cubos pequeños y mezcla tradicional para bases aromáticas.' }
        ]
      },
      {
        id: 'mod-3',
        title: 'Cocciones y Presentación',
        lessons: [
          { id: 'l-3-1', title: 'Sellado y control de temperatura', content: 'Cómo lograr Maillard ideal y jugosidad interna.' },
          { id: 'l-3-2', title: 'Emplatado moderno', content: 'Balance visual, color y texturas en presentación.' }
        ]
      }
    ];
  }

  toggleModule(module: ModuleItem) {
    if (this.expanded.has(module.id)) this.expanded.delete(module.id); else this.expanded.add(module.id);
  }

  isExpanded(module: ModuleItem) {
    return this.expanded.has(module.id);
  }

  onImgError(event: any) {
    try { (event.target as HTMLImageElement).src = '/assets/images/placeholder-course.png'; } catch {}
  }
}
