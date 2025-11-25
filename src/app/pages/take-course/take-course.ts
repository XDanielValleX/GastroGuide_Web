import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserProfile, UserSessionService } from '../../shared/user-session.service';

type RoleType = 'CREATOR' | 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | null;

interface LessonView {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  contentType: string;
  contentUrl: string | null;
  isFree: boolean;
  order: number;
  locked: boolean;
}

interface ModuleView {
  id: string | number;
  title: string;
  description: string;
  estimatedDuration: number;
  locked: boolean;
  lessons: LessonView[];
}

interface CourseSummary {
  id: string | number;
  title: string;
  description: string;
  status: string;
  image: string;
  level: string;
  language: string;
  totalDuration: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  publicationDate?: string;
  creationDate?: string;
  price?: number;
  discountPrice?: number | null;
  creatorName?: string;
}

interface CourseDetail extends CourseSummary {
  objectives: string[];
  requirements: string[];
  tags: string[];
  certificates: string[];
  modules: ModuleView[];
}

@Component({
  selector: 'app-take-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './take-course.html',
  styleUrl: './take-course.css'
})
export class TakeCourse implements OnInit, OnDestroy {
  courses: CourseSummary[] = [];
  filteredCourses: CourseSummary[] = [];
  selectedCourse: CourseDetail | null = null;
  selectedCourseId: string | number | null = null;
  role: RoleType = null;
  profile: UserProfile | null = null;

  listLoading = false;
  detailLoading = false;
  listError: string | null = null;
  detailError: string | null = null;

  searchTerm = '';
  private destroy$ = new Subject<void>();
  private pendingCourseId: string | number | null = null;
  private expandedModules = new Set<string | number>();
  private lastRequestedCourseId: string | number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly userSession: UserSessionService
  ) {
    const snapshotId = this.route.snapshot.paramMap.get('id');
    this.pendingCourseId = snapshotId;
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      this.pendingCourseId = id;
      if (this.courses.length && id) {
        this.trySelectCourse(id, false);
      }
    });

    this.userSession
      .ensureProfileLoaded()
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        this.profile = profile;
        this.role = (this.userSession.getRole(profile ?? undefined) as RoleType) ?? null;
        this.loadCourses(this.pendingCourseId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(term: string) {
    this.searchTerm = term;
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      this.filteredCourses = [...this.courses];
      return;
    }
    this.filteredCourses = this.courses.filter((course) =>
      [course.title, course.description, course.level, course.language]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }

  selectCourse(courseId: string | number, updateUrl = true) {
    if (String(this.selectedCourseId) === String(courseId)) {
      return;
    }
    const course = this.courses.find((c) => String(c.id) === String(courseId));
    if (!course) {
      this.detailError = 'Curso no encontrado.';
      return;
    }

    if (this.role === 'STUDENT' && course.status !== 'PUBLISHED') {
      this.detailError = 'Este curso aún no está publicado. Espera a que el creador lo publique.';
      return;
    }

    this.selectedCourseId = course.id;
    this.lastRequestedCourseId = course.id;
    this.detailLoading = true;
    this.detailError = null;
    this.expandedModules.clear();

    if (updateUrl) {
      const currentParam = this.route.snapshot.paramMap.get('id');
      if (currentParam !== String(courseId)) {
        this.router.navigate(['/take-course', courseId], { replaceUrl: true });
      }
    }

    this.fetchCourseDetail(course.id, course);
  }

  toggleModule(moduleId: string | number) {
    if (this.expandedModules.has(moduleId)) {
      this.expandedModules.delete(moduleId);
    } else {
      this.expandedModules.add(moduleId);
    }
  }

  isModuleExpanded(moduleId: string | number) {
    return this.expandedModules.has(moduleId);
  }

  lessonsCount(course: CourseDetail | null = this.selectedCourse): number {
    if (!course) return 0;
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  }

  moduleDuration(module: ModuleView): number {
    if (module.estimatedDuration) {
      return module.estimatedDuration;
    }
    return module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  }

  formatDuration(minutes?: number | null) {
    if (!minutes || minutes <= 0) {
      return '—';
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours && mins) {
      return `${hours} h ${mins} min`;
    }
    if (hours) {
      return `${hours} h`;
    }
    return `${mins} min`;
  }

  formatDate(value?: string) {
    if (!value) {
      return '—';
    }
    try {
      return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  }

  previewLesson(): LessonView | null {
    if (!this.selectedCourse) return null;
    for (const module of this.selectedCourse.modules) {
      const videoLesson = module.lessons.find((lesson) => lesson.contentUrl && lesson.contentType === 'VIDEO');
      if (videoLesson) {
        return videoLesson;
      }
    }
    return this.selectedCourse.modules[0]?.lessons[0] ?? null;
  }

  previewUrl(lesson?: LessonView | null): SafeResourceUrl | null {
    const target = lesson ?? this.previewLesson();
    if (!target?.contentUrl) {
      return null;
    }
    if (this.isYouTube(target.contentUrl)) {
      const embed = this.normalizeYouTubeUrl(target.contentUrl);
      return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    }
    if (target.contentUrl.endsWith('.mp4')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(target.contentUrl);
    }
    return null;
  }

  lessonTag(lesson: LessonView) {
    if (lesson.contentType === 'VIDEO') return 'Video';
    if (lesson.contentType === 'AUDIO') return 'Audio';
    return 'Recurso';
  }

  openLesson(lesson: LessonView) {
    if (!lesson.contentUrl) {
      this.detailError = 'Esta lección aún no tiene contenido asociado.';
      return;
    }
    if (lesson.locked && this.role === 'STUDENT') {
      this.detailError = 'Debes completar los módulos previos para desbloquear esta lección.';
      return;
    }
    window.open(lesson.contentUrl, '_blank', 'noopener');
  }

  safeImage(src?: string | null): string {
    if (!src) {
      return '/assets/images/placeholder-course.png';
    }
    return src;
  }

  scrollToCurriculum() {
    if (typeof document === 'undefined') return;
    const section = document.getElementById('curriculum');
    section?.scrollIntoView({ behavior: 'smooth' });
  }

  trackByCourse(_index: number, course: CourseSummary) {
    return course.id;
  }

  trackByModule(_index: number, module: ModuleView) {
    return module.id;
  }

  trackByLesson(_index: number, lesson: LessonView) {
    return lesson.id;
  }

  isCourseActive(courseId: string | number) {
    if (this.selectedCourseId == null) return false;
    return String(this.selectedCourseId) === String(courseId);
  }

  private loadCourses(initialCourseId?: string | number | null) {
    this.listLoading = true;
    this.listError = null;
    const endpoint = this.resolveListEndpoint();
    this.http
      .get<any>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const payload = Array.isArray(response) ? response : response?.data || response?.courses || [];
          this.courses = payload.map((course: any) => this.mapCourseSummary(course));
          this.filteredCourses = [...this.courses];
          this.listLoading = false;
          if (!this.courses.length) {
            this.detailError = 'Aún no hay cursos disponibles para mostrar.';
            return;
          }
          const target = initialCourseId || this.pendingCourseId || this.courses[0]?.id;
          this.trySelectCourse(target, false);
        },
        error: () => {
          this.listLoading = false;
          this.listError = 'No pudimos cargar los cursos. Intenta de nuevo más tarde.';
        }
      });
  }

  private trySelectCourse(courseId: string | number | null, updateUrl = true) {
    if (!courseId) {
      this.selectedCourse = null;
      return;
    }
    const course = this.courses.find((c) => String(c.id) === String(courseId));
    if (!course) {
      if (this.courses.length && !updateUrl) {
        this.selectCourse(this.courses[0].id, false);
      }
      return;
    }
    this.selectCourse(course.id, updateUrl);
  }

  private fetchCourseDetail(courseId: string | number, summary: CourseSummary) {
    const url = `${environment.apiUrl}/api/v1/courses/course/${courseId}`;
    this.http
      .get<any>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          if (String(this.lastRequestedCourseId) !== String(courseId)) {
            return;
          }
          const mapped = this.mapCourseDetail(detail, summary);
          this.selectedCourse = mapped;
          this.detailLoading = false;
          this.detailError = null;
          if (mapped.modules.length) {
            this.expandedModules.add(mapped.modules[0].id);
          }
        },
        error: () => {
          if (String(this.lastRequestedCourseId) !== String(courseId)) {
            return;
          }
          this.detailLoading = false;
          this.selectedCourse = { ...summary, modules: [], objectives: [], requirements: [], certificates: [], tags: [] };
          this.detailError = 'No pudimos obtener el detalle completo del curso, mostrando información básica.';
        }
      });
  }

  private resolveListEndpoint() {
    if (this.role === 'CREATOR' && this.profile?.id != null) {
      return `${environment.apiUrl}/api/v1/courses/all/creator/${this.profile.id}`;
    }
    if (this.role === 'STUDENT') {
      return `${environment.apiUrl}/api/v1/courses/all/published`;
    }
    return `${environment.apiUrl}/api/v1/courses/all`;
  }

  private mapCourseSummary(raw: any): CourseSummary {
    const status = (raw?.status || raw?.courseStatus || 'DRAFT').toString().toUpperCase();
    return {
      id: raw?.id ?? raw?._id ?? `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: raw?.title ?? 'Curso sin título',
      description: raw?.description ?? 'Pronto tendrás más información de este curso.',
      status,
      image: this.safeImage(raw?.image || raw?.coverImage),
      level: raw?.level ?? 'INTERMEDIATE',
      language: raw?.language ?? 'ES',
      totalDuration: Number(raw?.totalDuration ?? raw?.duration ?? 0),
      averageRating: Number(raw?.averageRating ?? raw?.rating ?? 0),
      totalReviews: Number(raw?.totalReviews ?? raw?.reviews ?? 0),
      totalStudents: Number(raw?.totalStudents ?? raw?.students ?? 0),
      publicationDate: raw?.publicationDate ?? raw?.creationDate,
      creationDate: raw?.creationDate,
      price: typeof raw?.price === 'number' ? raw.price : undefined,
      discountPrice: typeof raw?.discountPrice === 'number' ? raw.discountPrice : null,
      creatorName: raw?.creator?.fullName || raw?.creator?.username || raw?.creatorName || 'Instructor'
    };
  }

  private mapCourseDetail(raw: any, summary: CourseSummary): CourseDetail {
    const objectives = this.normalizeList(raw?.objectives ?? raw?.objective ?? summary.description);
    const requirements = this.normalizeList(raw?.requirements);
    const tags = this.normalizeList(raw?.tags);
    const certificates = this.normalizeList(raw?.certificates);
    const modules = Array.isArray(raw?.modules)
      ? raw.modules.map((module: any, index: number) => this.mapModule(module, index))
      : [];

    return {
      ...summary,
      title: raw?.title ?? summary.title,
      description: raw?.description ?? summary.description,
      language: raw?.language ?? summary.language,
      level: raw?.level ?? summary.level,
      totalDuration: Number(raw?.totalDuration ?? summary.totalDuration ?? 0),
      averageRating: Number(raw?.averageRating ?? summary.averageRating ?? 0),
      totalReviews: Number(raw?.totalReviews ?? summary.totalReviews ?? 0),
      totalStudents: Number(raw?.totalStudents ?? summary.totalStudents ?? 0),
      publicationDate: raw?.publicationDate ?? summary.publicationDate,
      creationDate: raw?.creationDate ?? summary.creationDate,
      price: typeof raw?.price === 'number' ? raw.price : summary.price,
      discountPrice: typeof raw?.discountPrice === 'number' ? raw.discountPrice : summary.discountPrice,
      creatorName: raw?.creator?.fullName || raw?.creator?.username || summary.creatorName,
      objectives,
      requirements,
      tags,
      certificates,
      modules
    };
  }

  private mapModule(module: any, index: number): ModuleView {
    const lessons = Array.isArray(module?.lessons)
      ? module.lessons.map((lesson: any, idx: number) => this.mapLesson(lesson, idx))
      : [];
    return {
      id: module?.id ?? `module-${index + 1}`,
      title: module?.title ?? `Sección ${index + 1}`,
      description: module?.description ?? '',
      estimatedDuration: Number(module?.estimatedDuration ?? module?.duration ?? 0),
      locked: !!module?.locked,
      lessons
    };
  }

  private mapLesson(lesson: any, idx: number): LessonView {
    const contentType = lesson?.contentType ?? (lesson?.contentUrl ? 'VIDEO' : 'RESOURCE');
    return {
      id: lesson?.id ?? `lesson-${idx + 1}`,
      title: lesson?.title ?? `Lección ${idx + 1}`,
      description: lesson?.description ?? 'Contenido próximamente.',
      duration: Number(lesson?.duration ?? 0),
      contentType,
      contentUrl: lesson?.contentUrl ?? null,
      isFree: lesson?.isFree ?? true,
      order: lesson?.order ?? idx + 1,
      locked: !!lesson?.locked
    };
  }

  private normalizeList(input: any): string[] {
    if (Array.isArray(input)) {
      return input
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => !!item);
    }
    if (typeof input === 'string') {
      return input
        .split(/\.|\n|-/)
        .map((item) => item.trim())
        .filter((item) => !!item);
    }
    return [];
  }

  private isYouTube(url: string) {
    return /youtube\.com|youtu\.be/.test(url || '');
  }

  private normalizeYouTubeUrl(url: string): string {
    const idMatch = url.match(/(?:v=|be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    const id = idMatch ? idMatch[1] : url;
    return `https://www.youtube.com/embed/${id}`;
  }
}
