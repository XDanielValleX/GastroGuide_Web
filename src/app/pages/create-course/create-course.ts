import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserSessionService, UserProfile } from '../../shared/user-session.service';

type Level = 'BEGINNER'|'INTERMEDIATE'|'ADVANCED'|'EXPERT';
type ContentType = 'VIDEO'|'TEXT'|'AUDIO'|'DOCUMENT'|'INTERACTIVE';

interface CreateCourseDto {
  id?: string;
  creatorId?: string | number;
  title: string;
  description: string;
  image?: string;
  level: Level;
  price: number;
  discountPrice?: number;
  language?: string;
  status?: string;
  tags?: string[];
  certificates?: string[];
  notes?: string[];
}

interface CreateModuleDto {
  course: number | string;
  title: string;
  description?: string;
  estimatedDuration?: number;
  locked?: boolean;
}

interface LessonDto {
  moduleId: number | string;
  title: string;
  description?: string;
  duration?: number;
  contentType?: ContentType;
  contentUrl?: string;
  isFree?: boolean;
}

interface ModuleDraft extends Omit<CreateModuleDto, 'course'> {
  id?: string;
  lessons: LessonDraft[];
}

interface LessonDraft extends Omit<LessonDto, 'moduleId'> {
  id?: string;
}

@Component({
  selector: 'app-create-course',
  standalone: true,
  templateUrl: './create-course.html',
  styleUrls: ['./create-course.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class CreateCourse implements OnInit, OnDestroy {

  // wizard step
  step = 1;

  // preview image (file) for local previews
  previewImage: string | null = null;
  selectedImageFile: File | null = null;
  uploadedImagePath: string | null = null;

  // course form model
  course: CreateCourseDto = {
    title: '',
    description: '',
    image: undefined,
    level: 'BEGINNER' as Level,
    price: 0,
    discountPrice: 0,
    language: 'es',
    status: 'DRAFT'
  };

  tagsInput = '';

  // modules + lessons local model
  modules: ModuleDraft[] = [];
  newModule: ModuleDraft = { title: '', description: '', estimatedDuration: 0, locked: false, lessons: [] };
  editingModuleIndex: number | null = null;

  // lessons
  newLesson: LessonDraft = { title: '', description: '', duration: 0, contentType: 'VIDEO', contentUrl: '', isFree: false };
  lessonModuleIndex = 0;
  editingLesson: { moduleIndex: number; lessonIndex: number } | null = null;

  // flags
  publishing = false;
  savingCourse = false;
  savingModules = false;
  savingLessons = false;
  loadingSavedCourses = false;
  toast: string | null = null;
  createdCourseId: string | null = null;
  savedCourseSnapshot: any = null;
  savedCourses: any[] = [];

  returnUrl = '/home3';
  currentUser: UserProfile | null = null;
  private userSub?: Subscription;
  private readonly MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
  private readonly AUTH_TOKEN_ERROR = 'AUTH_TOKEN_MISSING';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private userSession: UserSessionService
  ) {}

  ngOnInit(): void {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'home2') {
      this.returnUrl = '/home2';
    } else if (from === 'home3') {
      this.returnUrl = '/home3';
    } else if (from) {
      this.returnUrl = `/${from}`;
    }

    this.userSub = this.userSession.user$.subscribe((profile) => {
      this.applyCurrentUser(profile);
    });

    this.userSession.ensureProfileLoaded().subscribe({
      next: (profile) => {
        this.applyCurrentUser(profile);
        if (profile?.id !== undefined && profile?.id !== null) {
          this.loadSavedCourses();
        } else {
          this.resetSavedCourses();
        }
      },
      error: () => {
        this.showToast('No se pudo cargar tu sesión. Inicia sesión nuevamente.');
        this.resetSavedCourses();
      }
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  // image file selector preview
  onImageFile(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!this.validateImageFileSize(f)) {
      e.target.value = '';
      return;
    }
    this.selectedImageFile = f;
    this.uploadedImagePath = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
      this.course.image = '';
    };
    reader.readAsDataURL(f);
  }

  // wizard controls
  nextStep() {
    if (this.step===1) {
      // basic validation
      if (!this.course.title || this.course.title.length < 3 || !this.course.description || this.course.description.length < 10) {
        this.showToast('Completa título y descripción (mínimo 10 caracteres).'); return;
      }
      // apply tags
      this.course.tags = this.tagsInput ? this.tagsInput.split(',').map((t:string)=>t.trim()).filter(Boolean) : [];
    }
    if (this.step < 4) this.step++;
  }
  prevStep() { if (this.step > 1) this.step--; }
  cancel() { this.goBack(); }

  goBack() { this.router.navigate([this.returnUrl]); }

  barFill(index: number) {
    const completed = Math.max(0, this.step - 1);
    return completed > index ? 100 : 0;
  }

  // modules management
  addModule() {
    if (!this.newModule.title) { this.showToast('El título del módulo es obligatorio'); return; }
    const m: ModuleDraft = { ...this.newModule, lessons: [] };
    this.modules.push(m);
    this.newModule = { title:'', description:'', estimatedDuration:0, locked:false, lessons: [] };
    this.lessonModuleIndex = Math.max(this.modules.length - 1, 0);
  }
  editModule(i:number) { this.editingModuleIndex = i; }
  saveModule(i:number) { this.editingModuleIndex = null; }
  cancelEditModule() { this.editingModuleIndex = null; }
  removeModule(i:number) { this.modules.splice(i,1); }

  // lessons management
  addLessonToModule() {
    const idx = Number(this.lessonModuleIndex || 0);
    if (!this.newLesson.title) { this.showToast('Título de la lección requerido'); return; }
    if (!this.modules[idx]) { this.showToast('Selecciona un módulo válido'); return; }

    const payload = { ...this.newLesson };

    if (this.editingLesson) {
      const { moduleIndex, lessonIndex } = this.editingLesson;
      const fromModule = this.modules[moduleIndex];
      if (!fromModule || !fromModule.lessons[lessonIndex]) {
        this.showToast('No se encontró la lección a editar.');
        this.cancelLessonEdit();
        return;
      }

      if (moduleIndex === idx) {
        fromModule.lessons[lessonIndex] = payload;
      } else {
        fromModule.lessons.splice(lessonIndex, 1);
        this.modules[idx].lessons = this.modules[idx].lessons || [];
        this.modules[idx].lessons.push(payload);
      }
      this.showToast('Lección actualizada');
      this.cancelLessonEdit();
      return;
    }

    this.modules[idx].lessons = this.modules[idx].lessons || [];
    this.modules[idx].lessons.push(payload);
    this.resetLessonForm();
  }
  editLesson(mi:number, li:number) {
    const lesson = this.modules[mi]?.lessons?.[li];
    if (!lesson) { return; }
    this.editingLesson = { moduleIndex: mi, lessonIndex: li };
    this.lessonModuleIndex = mi;
    this.newLesson = { ...lesson };
  }
  cancelLessonEdit() {
    this.editingLesson = null;
    this.resetLessonForm();
  }
  removeLesson(mi:number, li:number) { this.modules[mi].lessons.splice(li,1); if (this.editingLesson && this.editingLesson.moduleIndex===mi && this.editingLesson.lessonIndex===li) { this.cancelLessonEdit(); } }
  private resetLessonForm() {
    this.newLesson = { title: '', description: '', duration: 0, contentType: 'VIDEO', contentUrl: '', isFree: false };
  }
  countLessons() { return this.modules.reduce((acc,m:any)=>acc + (m.lessons?.length||0), 0); }

  async saveCourseInfo(status: 'DRAFT' | 'PUBLISHED' = 'DRAFT'): Promise<boolean> {
    if (this.savingCourse) { return false; }
    if (!this.course.title || this.course.title.length < 3 || !this.course.description || this.course.description.length < 10) {
      this.showToast('Completa título y descripción (mínimo 10 caracteres).');
      return false;
    }
    const creatorId = this.getCurrentUserId();
    if (!creatorId) {
      this.showToast('Debes iniciar sesión para crear un curso.');
      return false;
    }
    const creatorPayloadId = this.castBackendId(creatorId);
    if (creatorPayloadId === undefined) {
      this.showToast('No se pudo determinar tu identificador de usuario.');
      return false;
    }
    this.course.tags = this.tagsInput ? this.tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    let success = false;
    this.savingCourse = true;
    try {
      this.showToast(status === 'PUBLISHED' ? 'Publicando curso...' : 'Guardando información del curso...');
      const imageValue = await this.ensureImageIsStored();
      const payload: CreateCourseDto = {
        id: this.createdCourseId ?? undefined,
        creatorId: creatorPayloadId,
        title: this.course.title,
        description: this.course.description,
        image: imageValue,
        level: this.course.level,
        price: this.course.price || 0,
        discountPrice: this.course.discountPrice || 0,
        language: this.course.language,
        status,
        tags: this.course.tags || []
      };

      const courseResp: any = await this.authorizedPost(`${environment.apiUrl}/api/v1/courses/add`, payload);
      const createdCourseId = courseResp?.id || courseResp?.data?.id;
      if (!createdCourseId) {
        throw new Error('El backend no devolvió un identificador de curso');
      }
      this.createdCourseId = String(createdCourseId);
      this.course.status = status;
      this.course.id = this.createdCourseId;
      this.course.creatorId = creatorId;
      await this.refreshSavedSnapshot(createdCourseId);
      this.showToast(status === 'PUBLISHED' ? 'Curso publicado' : 'Curso guardado');
      success = true;
    } catch (err: any) {
      if (this.isMissingAuthTokenError(err)) {
        this.showToast('Tu sesión expiró. Inicia sesión nuevamente.');
      } else {
        console.error('saveCourseInfo error', err);
        this.showToast('Error guardando curso: ' + (err?.message || 'server error'));
      }
    } finally {
      this.savingCourse = false;
    }
    return success;
  }

  async saveModules(): Promise<boolean> {
    if (this.savingModules) { return false; }
    if (!this.createdCourseId) {
      this.showToast('Guarda primero la información del curso.');
      return false;
    }
    const pending = this.modules.filter((m) => !m.id);
    if (!pending.length) {
      this.showToast('No hay módulos nuevos por guardar');
      return true;
    }
    const backendCourseId = this.castBackendId(this.createdCourseId) ?? this.createdCourseId;
    let success = false;
    this.savingModules = true;
    try {
      for (const moduleDraft of pending) {
        const modulePayload: CreateModuleDto = {
          course: backendCourseId,
          title: moduleDraft.title,
          description: moduleDraft.description,
          estimatedDuration: moduleDraft.estimatedDuration || 0,
          locked: !!moduleDraft.locked
        };
        const modResp: any = await this.authorizedPost(`${environment.apiUrl}/api/v1/modules/add`, modulePayload);
        const createdModuleId = modResp?.id || modResp?.data?.id;
        if (!createdModuleId) {
          throw new Error('El backend no devolvió un identificador de módulo');
        }
        moduleDraft.id = String(createdModuleId);
      }
      await this.refreshSavedSnapshot(this.createdCourseId);
      this.showToast('Módulos guardados');
      success = true;
    } catch (err: any) {
      if (this.isMissingAuthTokenError(err)) {
        this.showToast('Tu sesión expiró. Inicia sesión nuevamente.');
      } else {
        console.error('saveModules error', err);
        this.showToast('Error guardando módulos: ' + (err?.message || 'server error'));
      }
    } finally {
      this.savingModules = false;
    }
    return success;
  }

  async saveLessons(): Promise<boolean> {
    if (this.savingLessons) { return false; }
    if (!this.createdCourseId) {
      this.showToast('Primero guarda el curso y los módulos.');
      return false;
    }
    const modulesWithoutId = this.modules.filter((m) => !m.id);
    if (modulesWithoutId.length) {
      this.showToast('Guarda los módulos antes de las lecciones.');
      return false;
    }
    const pendingLessons: { module: ModuleDraft; lesson: LessonDraft }[] = [];
    this.modules.forEach((module) => {
      (module.lessons || []).forEach((lesson) => {
        if (!lesson.id) {
          pendingLessons.push({ module, lesson });
        }
      });
    });
    if (!pendingLessons.length) {
      this.showToast('No hay lecciones nuevas por guardar');
      return true;
    }
    let success = false;
    this.savingLessons = true;
    try {
      for (const { module, lesson } of pendingLessons) {
        if (!module.id) { continue; }
        const lessonPayload: LessonDto = {
          moduleId: this.castBackendId(module.id) ?? module.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration || 0,
          contentType: lesson.contentType || 'VIDEO',
          contentUrl: lesson.contentUrl || '',
          isFree: !!lesson.isFree
        };
        const lessonResp: any = await this.authorizedPost(`${environment.apiUrl}/api/v1/lessons/add`, lessonPayload);
        const createdLessonId = lessonResp?.id || lessonResp?.data?.id;
        if (!createdLessonId) {
          throw new Error('El backend no devolvió un identificador de lección');
        }
        lesson.id = String(createdLessonId);
      }
      await this.refreshSavedSnapshot(this.createdCourseId);
      this.showToast('Lecciones guardadas');
      success = true;
    } catch (err: any) {
      if (this.isMissingAuthTokenError(err)) {
        this.showToast('Tu sesión expiró. Inicia sesión nuevamente.');
      } else {
        console.error('saveLessons error', err);
        this.showToast('Error guardando lecciones: ' + (err?.message || 'server error'));
      }
    } finally {
      this.savingLessons = false;
    }
    return success;
  }

  async publishCourse() {
    const creatorId = this.getCurrentUserId();
    if (!creatorId) {
      this.showToast('Debes iniciar sesión para publicar un curso.');
      return;
    }
    try {
      this.publishing = true;
      if (!this.createdCourseId) {
        const initialSaved = await this.saveCourseInfo();
        if (!initialSaved) {
          this.showToast('Guarda la información básica antes de publicar.');
          return;
        }
      }
      const modulesSaved = await this.saveModules();
      if (!modulesSaved) {
        return;
      }
      const lessonsSaved = await this.saveLessons();
      if (!lessonsSaved) {
        return;
      }
      const published = await this.saveCourseInfo('PUBLISHED');
      if (!published) {
        return;
      }
      this.showToast('Curso guardado y publicado correctamente.');
      this.router.navigate([this.returnUrl]);
    } catch (err:any) {
      console.error('publishCourse error', err);
      this.showToast('Error publicando curso: ' + (err?.message || 'server error'));
    } finally {
      this.publishing = false;
    }
  }

  async loadSavedCourses(targetCourseId?: string) {
    this.loadingSavedCourses = true;
    try {
      const ownerId = this.getCurrentUserId();
      if (!ownerId) {
        this.resetSavedCourses();
        return;
      }
      const token = this.userSession.getToken();
      if (!token) {
        this.showToast('Inicia sesión para sincronizar tus cursos guardados.');
        this.resetSavedCourses();
        return;
      }
      const role = (this.userSession.getRole(this.currentUser) || '').toUpperCase();
      if (role !== 'CREATOR') {
        this.showToast('Activa tu perfil de creador para gestionar cursos.');
        this.resetSavedCourses();
        return;
      }
      const resp: any = await this.authorizedGet(`${environment.apiUrl}/api/v1/courses/all`);
      const allCourses = Array.isArray(resp) ? resp : (resp?.data || []);
      this.savedCourses = allCourses.filter((course: any) => this.belongsToCurrentUser(course));

      const selectedId = targetCourseId || this.createdCourseId;
      if (selectedId) {
        const match = this.savedCourses.find((c: any) => String(c.id) === String(selectedId));
        this.savedCourseSnapshot = match || null;
        this.createdCourseId = match ? String(match.id) : this.createdCourseId;
      } else {
        this.savedCourseSnapshot = null;
      }
      if (this.savedCourseSnapshot?.image) {
        this.previewImage = this.savedCourseSnapshot.image;
        this.uploadedImagePath = this.savedCourseSnapshot.image;
      }
    } catch (err: any) {
      if (this.isMissingAuthTokenError(err)) {
        this.showToast('Tu sesión expiró. Inicia sesión nuevamente.');
        this.resetSavedCourses();
      } else if (err?.status === 403) {
        this.showToast('Tu sesión no tiene permisos para cargar cursos guardados. Vuelve a iniciar sesión si ya eres creador.');
      } else {
        console.error('loadSavedCourses error', err);
        this.showToast('No se pudieron cargar los cursos guardados');
      }
    } finally {
      this.loadingSavedCourses = false;
    }
  }

  private async refreshSavedSnapshot(targetCourseId?: string) {
    await this.loadSavedCourses(targetCourseId);
  }

  selectSavedCourse(courseId: string) {
    if (!courseId) { return; }
    const selected = this.savedCourses.find((c:any) => String(c.id) === String(courseId));
    if (!selected) { return; }
    if (!this.belongsToCurrentUser(selected)) {
      this.showToast('No tienes permiso para editar este curso.');
      return;
    }
    this.createdCourseId = String(selected.id);
    this.savedCourseSnapshot = selected;

    this.course = {
      id: selected.id,
      creatorId: selected.creatorId ?? this.getCurrentUserId() ?? undefined,
      title: selected.title,
      description: selected.description,
      image: selected.image,
      level: selected.level as Level,
      price: Number(selected.price) || 0,
      discountPrice: Number(selected.discountPrice) || 0,
      language: selected.language,
      status: selected.status,
      tags: selected.tags || []
    };
    this.tagsInput = (selected.tags || []).join(', ');
    this.modules = (selected.modules || []).map((m:any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      estimatedDuration: Number(m.estimatedDuration) || 0,
      locked: m.locked,
      lessons: (m.lessons || []).map((l:any) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        duration: Number(l.duration) || 0,
        contentType: l.contentType,
        contentUrl: l.contentUrl,
        isFree: l.isFree
      }))
    }));
    this.lessonModuleIndex = 0;
    this.previewImage = selected.image;
    this.selectedImageFile = null;
    this.uploadedImagePath = selected.image || null;
    this.showToast('Curso cargado desde guardados');
  }

  savedLessonsCount(course: any): number {
    if (!course?.modules?.length) { return 0; }
    return course.modules.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0);
  }

  private async ensureImageIsStored(): Promise<string | undefined> {
    if (this.selectedImageFile) {
      if (this.uploadedImagePath) {
        return this.uploadedImagePath;
      }
      if (!this.validateImageFileSize(this.selectedImageFile)) {
        this.selectedImageFile = null;
        return undefined;
      }
      const formData = new FormData();
      formData.append('file', this.selectedImageFile);
      const uploadResp: any = await this.authorizedPost(`${environment.apiUrl}/api/v1/files/upload`, formData);
      const storedPath = uploadResp?.url || uploadResp?.path || uploadResp?.data?.url || uploadResp?.data?.path;
      if (!storedPath) {
        throw new Error('El backend no devolvió la ruta del archivo subido');
      }
      this.uploadedImagePath = storedPath;
      this.course.image = storedPath;
      this.previewImage = storedPath;
      this.selectedImageFile = null;
      return storedPath;
    }
    return this.course.image ? this.course.image.trim() : undefined;
  }

  // small UI helpers
  showToast(msg:string) {
    this.toast = msg;
    setTimeout(()=> this.toast = null, 3500);
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { redirectTo: 'create-course' } });
  }

  private applyCurrentUser(profile: UserProfile | null | undefined) {
    this.currentUser = profile ?? null;
    const resolvedId = this.resolveProfileId(this.currentUser);
    this.course.creatorId = resolvedId ?? undefined;
  }

  private resetSavedCourses() {
    this.savedCourses = [];
    this.savedCourseSnapshot = null;
    this.createdCourseId = null;
    this.previewImage = null;
    this.uploadedImagePath = null;
  }

  private getCurrentUserId(): string | null {
    return this.resolveProfileId(this.currentUser);
  }

  private belongsToCurrentUser(course: any): boolean {
    const ownerId = this.getCurrentUserId();
    if (!ownerId) {
      return false;
    }
    const courseOwner =
      course?.creatorId ??
      course?.creator?.id ??
      course?.creator?.userId ??
      course?.userId ??
      course?.user?.id;
    if (courseOwner === undefined || courseOwner === null) {
      return false;
    }
    return String(courseOwner) === ownerId;
  }

  private resolveProfileId(profile?: UserProfile | null): string | null {
    if (!profile) {
      return null;
    }
    const candidate =
      profile.id ??
      (profile as any)?.userId ??
      (profile as any)?.user?.id ??
      (profile as any)?.user?.userId ??
      (profile as any)?.data?.id ??
      (profile as any)?.data?.userId;
    if (candidate === undefined || candidate === null) {
      return null;
    }
    const normalized = String(candidate).trim();
    return normalized || null;
  }

  private async authorizedGet<T>(url: string, params?: Record<string, any>): Promise<T> {
    const headers = this.requireAuthHeaders();
    const options: { headers: HttpHeaders; params?: Record<string, any> } = { headers };
    if (params) {
      options.params = params;
    }
    return firstValueFrom(this.http.get<T>(url, options));
  }

  private async authorizedPost<T>(url: string, body: any, params?: Record<string, any>): Promise<T> {
    const headers = this.requireAuthHeaders();
    const options: { headers: HttpHeaders; params?: Record<string, any> } = { headers };
    if (params) {
      options.params = params;
    }
    return firstValueFrom(this.http.post<T>(url, body, options));
  }

  private requireAuthHeaders(): HttpHeaders {
    const token = this.userSession.getToken();
    if (!token) {
      throw new Error(this.AUTH_TOKEN_ERROR);
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private isMissingAuthTokenError(err: any): boolean {
    return !!err && typeof err === 'object' && 'message' in err && err.message === this.AUTH_TOKEN_ERROR;
  }

  private validateImageFileSize(file: File): boolean {
    if (file.size <= this.MAX_IMAGE_SIZE_BYTES) {
      return true;
    }
    const limitMb = Math.round((this.MAX_IMAGE_SIZE_BYTES / (1024 * 1024)) * 10) / 10;
    this.showToast(`La imagen supera el límite de ${limitMb} MB permitido.`);
    return false;
  }

  private castBackendId(value: string | number | null | undefined): string | number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    const normalized = String(value).trim();
    if (!normalized) {
      return undefined;
    }
    return /^\d+$/.test(normalized) ? Number(normalized) : normalized;
  }
}
