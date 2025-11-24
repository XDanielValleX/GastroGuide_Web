import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

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
