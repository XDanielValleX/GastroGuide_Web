import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { PurchasedCoursesService } from '../../shared/purchased-courses.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment {
  course: {
    id: string | number;
    title: string;
    price: number;
    discountPrice: number | null;
  } | null = null;
  
  // Datos del formulario
  billingData = {
    country: 'Colombia',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardName: '',
    saveCard: false
  };
  
  // Estado del curso completo (con módulos y lecciones)
  fullCourseData: any = null;
  
  loading = true;
  error: string | null = null;
  processing = false;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private router: Router,
    private purchasedCoursesService: PurchasedCoursesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const nav = this.router.getCurrentNavigation();
    const state: any = nav?.extras?.state || history.state;

    if (!id) {
      this.loading = false;
      this.error = 'Curso no especificado';
      return;
    }

    // Prefill if state passed
    if (state && (state.title || state.price)) {
      this.course = {
        id,
        title: state.title || 'Curso',
        price: typeof state.price === 'number' ? state.price : 0,
        discountPrice: typeof state.discountPrice === 'number' ? state.discountPrice : null
      };
      // Guardar el estado completo como fullCourseData
      this.fullCourseData = state;
    }

    this.fetchCourse(id);
  }

  fetchCourse(id: string) {
    const url = `${environment.apiUrl}/api/v1/courses/${id}`;
    this.http.get<any>(url).subscribe({
      next: (c) => {
        if (!c) {
          this.loading = false;
          this.error = 'Curso no encontrado';
          return;
        }
        const priceVal = this.normalizeNumber(c.price, this.course?.price) || 0;
        const discountVal = this.resolveDiscount(c, priceVal);
        this.course = {
          id: c.id || id,
          title: c.title || this.course?.title || 'Curso',
          price: priceVal,
          discountPrice: discountVal
        };
        // Guardar datos completos del curso (incluye módulos y lecciones)
        this.fullCourseData = c;
        this.loading = false;
        this.error = null;
      },
      error: () => {
        if (this.course) {
          this.loading = false;
          this.error = null; // keep prefilled
        } else {
          this.loading = false;
          this.error = 'No se pudo cargar la información del curso';
        }
      }
    });
  }

  processPurchase() {
    if (this.processing || !this.course) return;
    
    // Validar datos básicos del formulario
    if (!this.billingData.cardNumber || !this.billingData.expiryDate || 
        !this.billingData.cvc || !this.billingData.cardName) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos de pago',
        icon: 'warning',
        confirmButtonColor: '#FF6028'
      });
      return;
    }

    // Validación básica de formato
    if (this.billingData.cardNumber.replace(/\s/g, '').length < 13) {
      Swal.fire({
        title: 'Tarjeta inválida',
        text: 'El número de tarjeta debe tener al menos 13 dígitos',
        icon: 'error',
        confirmButtonColor: '#FF6028'
      });
      return;
    }

    this.processing = true;

    // Simular procesamiento de pago
    setTimeout(() => {
      // Guardar datos del formulario (simulación)
      console.log('Datos de facturación guardados:', this.billingData);
      console.log('Curso comprado:', this.course);

      // Preparar datos del curso para guardar
      const purchasedCourse = {
        id: this.course!.id,
        title: this.course!.title,
        description: this.fullCourseData?.description || this.fullCourseData?.objective || 'Aprende nuevas habilidades con este curso',
        image: this.fullCourseData?.image || this.fullCourseData?.coverImage || 'https://via.placeholder.com/640x360.png?text=Curso',
        instructor: this.extractInstructor(this.fullCourseData),
        price: this.course!.price,
        discountPrice: this.course!.discountPrice,
        language: this.fullCourseData?.language || 'ES',
        purchaseDate: new Date().toISOString(),
        progreso: 0,
        rating: this.fullCourseData?.rating || 4.5,
        modules: this.fullCourseData?.modules || [],
        lessons: this.extractAllLessons(this.fullCourseData?.modules || [])
      };

      console.log('Curso a guardar:', purchasedCourse);

      // Guardar en el servicio
      this.purchasedCoursesService.addCourse(purchasedCourse);

      this.processing = false;

      // Mostrar mensaje de éxito
      Swal.fire({
        title: '¡Compra exitosa!',
        text: `Has adquirido el curso "${this.course!.title}"`,
        icon: 'success',
        confirmButtonText: 'Ver mis cursos',
        confirmButtonColor: '#FF6028',
        showCancelButton: true,
        cancelButtonText: 'Continuar navegando'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirigir a ver mis cursos
          this.router.navigate(['/home2/ver-mis-cursos']);
        } else {
          // Volver a cursos
          this.router.navigate(['/home2/courses']);
        }
      });
    }, 1500);
  }

  private extractInstructor(courseData: any): string {
    if (!courseData) return 'Instructor';
    if (courseData.creator && typeof courseData.creator === 'object') {
      return courseData.creator.name || courseData.creator.username || 
             (courseData.creator.firstName && courseData.creator.lastName 
               ? `${courseData.creator.firstName} ${courseData.creator.lastName}` 
               : courseData.creator.firstName) || 'Instructor';
    } else if (typeof courseData.creator === 'string' && courseData.creator.trim()) {
      return courseData.creator;
    }
    return courseData.instructor || courseData.author || 'Instructor';
  }

  private extractAllLessons(modules: any[]): any[] {
    if (!Array.isArray(modules)) return [];
    const allLessons: any[] = [];
    modules.forEach(module => {
      if (Array.isArray(module.lessons)) {
        allLessons.push(...module.lessons);
      }
    });
    return allLessons;
  }

  finalPrice() {
    if (!this.course) return 0;
    if (this.course.discountPrice != null && this.course.discountPrice < this.course.price) return this.course.discountPrice;
    return this.course.price;
  }

  discountPercent() {
    if (!this.course || this.course.discountPrice == null) return null;
    if (this.course.discountPrice >= this.course.price) return null;
    const base = this.course.price || 1;
    return Math.round(((this.course.price - this.course.discountPrice) / base) * 100);
  }

  discountAmount() {
    if (!this.course || this.course.discountPrice == null) return 0;
    if (this.course.discountPrice >= this.course.price) return 0;
    return this.course.price - this.course.discountPrice;
  }

  format(n: number | null | undefined) {
    if (n == null) return '0';
    try { return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); } catch { return Math.round(n).toString(); }
  }

  private normalizeNumber(value: any, fallback?: number | null): number | null {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.,-]/g,'').replace(/,/g,'');
      const parsed = Number(cleaned);
      if (!isNaN(parsed)) return parsed;
    }
    return fallback != null ? fallback : null;
  }

  private resolveDiscount(c: any, priceVal: number): number | null {
    // Accept multiple backend field names for future courses
    const direct = this.normalizeNumber(c.discountPrice, this.course?.discountPrice);
    const alt1 = this.normalizeNumber(c.discount, direct);
    const alt2Percent = this.normalizeNumber(c.discountPercent ?? c.discount_percentage ?? c.discount_percent, null);
    if (alt2Percent != null && priceVal) {
      const computed = Math.round(priceVal * (1 - alt2Percent / 100));
      // If direct not set or computed is smaller, prefer computed
      if (direct == null || (computed < direct && computed < priceVal)) return computed;
    }
    // Ensure discount is less than price to be valid
    const candidate = direct != null ? direct : alt1;
    if (candidate != null && candidate < priceVal) return candidate;
    return null;
  }
}
