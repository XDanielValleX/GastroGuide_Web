import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CoursesService } from '../../shared/courses.service';

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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private coursesSvc: CoursesService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.error = 'Curso no especificado';
      return;
    }
    // Cargar directamente desde la API
    this.fetchDetail(id, 'Curso');
  }

  fetchDetail(id: string | number, titleFallback: string) {
    // Tu backend no tiene endpoint /courses/:id, así que usamos /courses/all y filtramos
    const url = `${environment.apiUrl}/api/v1/courses/all`;
    console.log('🔍 Cargando todos los cursos desde:', url);
    console.log('🔍 Buscando curso con ID:', id);
    
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        console.log('📦 RESPUESTA COMPLETA:', resp);
        
        // La API devuelve un array de cursos
        const courses = resp?.data || resp?.courses || resp || [];
        console.log('📋 Total de cursos:', Array.isArray(courses) ? courses.length : 0);
        
        if (!Array.isArray(courses)) {
          console.error('❌ La respuesta no es un array');
          this.error = 'No se pudo cargar la información del curso';
          this.loading = false;
          return;
        }

        // Buscar el curso por ID
        const c = courses.find((course: any) => String(course.id) === String(id));
        
        console.log('📝 CURSO ENCONTRADO:', c);
        console.log('🔑 PROPIEDADES DISPONIBLES:', c ? Object.keys(c) : 'No encontrado');
        console.log('🔑 VALORES COMPLETOS DEL CURSO:', {
          id: c.id,
          title: c.title,
          description: c.description,
          modules: c.modules,
          allProps: c
        });
        
        if (!c) {
          console.error('❌ Curso no encontrado con ID:', id);
          this.error = 'Curso no encontrado';
          this.loading = false;
          return;
        }

        // Mapear usando los campos EXACTOS que envía create-course
        // Extraer el instructor/creador
        let instructorName = 'Instructor';
        if (c.creator && typeof c.creator === 'object') {
          instructorName = c.creator.name || c.creator.username || 
                         (c.creator.firstName && c.creator.lastName ? `${c.creator.firstName} ${c.creator.lastName}` : c.creator.firstName) ||
                         'Instructor';
        } else if (typeof c.creator === 'string' && c.creator.trim()) {
          instructorName = c.creator;
        } else if (c.creatorId) {
          instructorName = `Instructor ${c.creatorId}`;
        }

        // Extraer la fecha de publicación - usar publicationDate del endpoint
        const publishDate = c.publicationDate || c.creationDate || new Date().toISOString();

        // Extraer objective: puede ser string u array
        let objectiveText = 'Aprender habilidades del tema.';
        if (Array.isArray(c.objectives) && c.objectives.length > 0) {
          objectiveText = c.objectives.join('. ');
        } else if (typeof c.objective === 'string' && c.objective.trim()) {
          objectiveText = c.objective;
        } else if (c.description) {
          objectiveText = c.description;
        }

        this.course = {
          id: c.id || id,
          title: c.title || titleFallback,
          instructor: instructorName,
          description: c.description || '',
          language: c.language || 'ES',
          price: typeof c.price === 'number' ? c.price : 0,
          discountPrice: typeof c.discountPrice === 'number' ? c.discountPrice : null,
          publishedAt: publishDate,
          coverImage: c.image || 'creator-illustration.svg',
          objective: objectiveText,
          modules: []
        };

        // Mapear módulos según el esquema del endpoint
        console.log('🔍 VERIFICANDO MÓDULOS:');
        console.log('  - c.modules existe?', !!c.modules);
        console.log('  - c.modules es array?', Array.isArray(c.modules));
        console.log('  - c.modules.length:', Array.isArray(c.modules) ? c.modules.length : 'N/A');
        console.log('  - c.modules RAW:', JSON.stringify(c.modules, null, 2));
        
        // Mapear módulos si existen
        if (Array.isArray(c.modules) && c.modules.length > 0) {
          console.log('📚 Módulos encontrados:', c.modules.length);
          
          this.course.modules = c.modules.map((m: any, i: number) => {
            console.log(`🔍 Módulo ${i+1}:`, m);
            console.log(`  - title: ${m.title}`);
            console.log(`  - description: ${m.description}`);
            console.log(`  - lessons:`, m.lessons);
            
            const mappedLessons = Array.isArray(m.lessons) ? m.lessons.map((l: any, j: number) => {
              console.log(`    📖 Lección ${j+1}:`, l);
              console.log(`      - title: ${l.title}`);
              console.log(`      - description: ${l.description}`);
              
              return {
                id: l.id || `l-${i+1}-${j+1}`,
                title: l.title || `Lección ${j+1}`,
                content: l.description || l.contentUrl || 'Contenido no disponible.'
              };
            }) : [];
            
            return {
              id: m.id || `mod-${i+1}`,
              title: m.title || `Módulo ${i+1}`,
              lessons: mappedLessons
            };
          });
          
          console.log('✅ Módulos mapeados correctamente:', this.course.modules);
        } else {
          console.warn('⚠️ c.modules está vacío o es null. El backend no está retornando los módulos.');
          console.warn('⚠️ Verifica que el backend esté configurado para incluir módulos en /api/v1/courses/all');
          this.course.modules = [{
            id: 'mod-default',
            title: 'Contenido del curso',
            lessons: [{
              id: 'l-default',
              title: 'Material del curso',
              content: 'Los módulos y lecciones no están disponibles. Verifica la configuración del backend.'
            }]
          }];
        }
        
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('❌ Error al cargar los cursos:', err);
        this.error = 'Error al cargar la información del curso. Por favor, intenta de nuevo.';
        this.loading = false;
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
}
