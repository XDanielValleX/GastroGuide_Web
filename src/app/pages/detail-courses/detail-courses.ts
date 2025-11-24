import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { UserSessionService } from '../../shared/user-session.service';


interface LessonItem {
  id: string | number;
  title: string;
  content: string;
  videoUrl?: string | null;
  contentType?: string;
}

interface ModuleItem {
  id: string | number;
  title: string;
  lessons: LessonItem[];
}

interface CourseDetail {
  id: string | number;
  title: string;
  instructor: string;      // creador
  description: string;     // descripción
  language: string;        // idioma
  price: number;           // precio
  discountPrice: number | null;
  publishedAt: string | null; // última actualización / fecha
  coverImage: string;      // imgPortada
  objective: string;       // objetivo
  modules: ModuleItem[];   // módulos con lecciones
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
  private readonly SAMPLE_PREFIX = 'SAMPLE_';

  private currentRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    private userSession: UserSessionService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.currentRole = this.userSession.getRole();
    const nav = this.router.getCurrentNavigation();
    const state = (nav && nav.extras && nav.extras.state) ? nav.extras.state as any : history.state;

    if (!id) {
      this.loading = false;
      this.error = 'Curso no especificado';
      return;
    }

    if (state && (state.title || state.coverImage || state.instructor)) {
      this.course = {
        id: id,
        title: state.title || 'Curso',
        instructor: state.instructor || 'Instructor',
        description: state.description || 'Descripción no disponible.',
        language: state.language || 'ES',
        price: typeof state.price === 'number' ? state.price : 0,
        discountPrice: typeof state.discountPrice === 'number' ? state.discountPrice : null,
        publishedAt: state.publishedAt || null,
        coverImage: state.coverImage || state.image || 'creator-illustration.svg',
        objective: state.objective || 'Aprender habilidades del tema.',
        modules: []
      };
    }

    if (String(id).startsWith(this.SAMPLE_PREFIX) && this.course) {
      // Inject dummy modules for sample course if empty
      if (!this.course.modules || !this.course.modules.length) {
        this.course.modules = [
          { id: 'mod-1', title: 'Introducción', lessons: [
            { id: 'l-1-1', title: 'Bienvenida', content: 'Presentación general del curso.' },
            { id: 'l-1-2', title: 'Objetivos', content: 'Qué aprenderás y cómo aprovechar el contenido.' }
          ]},
          { id: 'mod-2', title: 'Fundamentos', lessons: [
            { id: 'l-2-1', title: 'Conceptos clave', content: 'Repaso de los pilares básicos.' },
            { id: 'l-2-2', title: 'Primer ejercicio', content: 'Aplicación práctica inicial.' }
          ]}
        ];
      }
      this.loading = false;
      return;
    }

    this.fetchDetail(id, this.course?.title || 'Curso');
  }

  fetchDetail(id: string | number, titleFallback: string) {
    const url = `${environment.apiUrl}/api/v1/courses/${id}`;
    this.http.get<any>(url).subscribe({
      next: (c) => {
        if (!c) {
          this.error = 'Curso no encontrado';
          this.loading = false;
          return;
        }
        let instructorName = 'Instructor';
        if (c.creator && typeof c.creator === 'object') {
          instructorName = c.creator.fullName || c.creator.username || 'Instructor';
        }
        const publishDate = c.publicationDate || c.creationDate || new Date().toISOString();
        let objectiveText = 'Aprender habilidades del tema.';
        if (Array.isArray(c.objectives) && c.objectives.length) objectiveText = c.objectives.join('. ');
        else if (typeof c.objective === 'string' && c.objective.trim()) objectiveText = c.objective;
        else if (c.description) objectiveText = c.description;

        // Determinar si está publicado (mismas heurísticas que listado)
        const isPublished = !!(
          c.isPublished === true ||
          c.published === true ||
          c.status === 'PUBLISHED' ||
          c.state === 'PUBLISHED' ||
          c.visibility === 'PUBLIC' ||
          c.publicationDate ||
          c.publishedAt
        );

        // Si estudiante y no publicado => bloquear acceso
        if (this.currentRole === 'STUDENT' && !isPublished) {
          this.loading = false;
          Swal.fire({
            title: 'Curso no disponible',
            text: 'Este curso todavía no está publicado.',
            icon: 'info',
            confirmButtonText: 'Volver'
          }).then(() => {
            this.router.navigate(['/courses']);
          });
          return;
        }

        const backendCourse: CourseDetail = {
          id: c.id || id,
          title: c.title || titleFallback,
          instructor: instructorName,
          description: c.description || '',
          language: c.language || 'ES',
          price: typeof c.price === 'number' ? c.price : 0,
          discountPrice: typeof c.discountPrice === 'number' ? c.discountPrice : null,
          publishedAt: publishDate,
          coverImage: c.image || this.course?.coverImage || 'creator-illustration.svg',
          objective: objectiveText,
          modules: Array.isArray(c.modules) ? c.modules.map((m: any, i: number) => ({
            id: m.id || `mod-${i+1}`,
            title: m.title || `Módulo ${i+1}`,
            lessons: Array.isArray(m.lessons) ? m.lessons.map((l: any, j: number) => ({
              id: l.id,
              title: l.title,
              content: l.description,
              videoUrl: l.contentType === 'VIDEO' ? l.contentUrl : null,
              contentType: l.contentType
            })) : []
          })) : []
        };
        this.course = this.course ? { ...this.course, ...backendCourse } : backendCourse;
        this.loading = false;
        this.error = null;
      },
      error: () => {
        if (this.course) {
          // keep prefilled data
          this.loading = false;
          this.error = null;
        } else {
          this.error = 'No se pudo cargar la información del curso';
          this.loading = false;
        }
      }
    });
  }

  formatDate(d: string | null | undefined) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }); } catch { return d as string; }
  }

  toggleModule(module: ModuleItem) {
    if (this.expanded.has(module.id)) this.expanded.delete(module.id); else this.expanded.add(module.id);
  }

  isExpanded(module: ModuleItem) {
    return this.expanded.has(module.id);
  }

  onImgError(event: any) {
    try { (event.target as HTMLImageElement).src = 'creator-illustration.svg'; } catch {}
  }

  currentInHome2() {
    return this.router.url.includes('/home2/');
  }

  // Devuelve la URL del primer video disponible en el curso (para preview)
  getFirstVideo(): string | null {
    if (!this.course?.modules) return null;
    for (const m of this.course.modules) {
      for (const l of m.lessons) {
        if (l.videoUrl) return l.videoUrl;
      }
    }
    return null;
  }

  // Detecta si la URL es de YouTube
  isYouTube(url?: string | null): boolean {
    return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
  }

  // Convierte URL de YouTube a formato embed
  getSafeVideo(url: string): SafeResourceUrl {
    const id = this.getYouTubeId(url);
    const embed = `https://www.youtube.com/embed/${id}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }

  // Extrae el ID de YouTube incluyendo shorts
  getYouTubeId(url: string): string {
    let match = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
    match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  // Cuenta cuántas lecciones con video tiene un módulo
  countVideos(module: ModuleItem): number {
    if (!module?.lessons) return 0;
    return module.lessons.filter((l: any) => !!(l && (l as any).videoUrl)).length;
  }
}
