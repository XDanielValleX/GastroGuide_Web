import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Course {
  id: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
  precio?: number;
  rating?: number;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private courses: Course[] = [
    { id: 1, titulo: 'Cocina Italiana Tradicional', descripcion: 'Aprende a preparar pastas, pizzas y salsas auténticas con chefs expertos.', imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', precio: 29.99, rating: 4.8 },
    { id: 2, titulo: 'Postres y Repostería Moderna', descripcion: 'Domina técnicas de repostería y crea postres de nivel profesional.', imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', precio: 19.99, rating: 4.6 },
    { id: 3, titulo: 'Cocina Colombiana de Autor', descripcion: 'Explora recetas típicas con un toque contemporáneo y presentación gourmet.', imagen: 'https://images.unsplash.com/photo-1589307000254-0072d41ea6c3?auto=format&fit=crop&w=800&q=80', precio: 24.99, rating: 4.9 },
  ];

  // reactive state
  private cartSubject = new BehaviorSubject<Course[]>([]);
  readonly cart$ = this.cartSubject.asObservable();

  private purchasesSubject = new BehaviorSubject<Course[]>([]);
  readonly purchases$ = this.purchasesSubject.asObservable();

  constructor() {
    // initialize from localStorage if present
    try {
      const c = localStorage.getItem('gg_cart');
      const p = localStorage.getItem('gg_purchases');
      if (c) this.cartSubject.next(JSON.parse(c));
      if (p) this.purchasesSubject.next(JSON.parse(p));
    } catch (e) {
      // ignore JSON errors
    }
  }

  private persist() {
    try {
      localStorage.setItem('gg_cart', JSON.stringify(this.cartSubject.value));
      localStorage.setItem('gg_purchases', JSON.stringify(this.purchasesSubject.value));
    } catch (e) {
      // ignore
    }
  }

  getAllCourses(): Course[] {
    return this.courses.slice();
  }

  getCourseById(id: number): Course | undefined {
    return this.courses.find(c => c.id === id);
  }

  addToCart(course: Course) {
    const current = this.cartSubject.value.slice();
    if (current.some(c => c.id === course.id)) {
      return false; // already in cart
    }
    current.push(course);
    this.cartSubject.next(current);
    this.persist();
    return true;
  }

  clearCart() {
    this.cartSubject.next([]);
    this.persist();
  }

  buyCart() {
    const currentPurchases = this.purchasesSubject.value.slice();
    const cartItems = this.cartSubject.value.slice();
    // add only items not already purchased
    const combined = currentPurchases.slice();
    for (const it of cartItems) {
      if (!combined.some(c => c.id === it.id)) combined.push(it);
    }
    this.purchasesSubject.next(combined);
    this.clearCart();
    this.persist();
  }

  buyCourse(course: Course) {
    // buy single course immediately, avoid duplicates
    const purchases = this.purchasesSubject.value.slice();
    if (purchases.some(c => c.id === course.id)) return false;
    purchases.push(course);
    this.purchasesSubject.next(purchases);
    this.persist();
    return true;
  }

  getCartSnapshot(): Course[] {
    return this.cartSubject.value.slice();
  }

  getPurchasesSnapshot(): Course[] {
    return this.purchasesSubject.value.slice();
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((s, c) => s + (c.precio || 0), 0);
  }
}
