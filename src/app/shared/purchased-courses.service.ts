import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PurchasedCourse {
  id: string | number;
  title: string;
  description: string;
  image: string;
  instructor?: string;
  price?: number;
  discountPrice?: number | null;
  language?: string;
  purchaseDate: string;
  progreso: number;
  rating?: number;
  modules?: any[];
  lessons?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PurchasedCoursesService {
  private readonly STORAGE_KEY = 'purchased_courses';
  private coursesSubject = new BehaviorSubject<PurchasedCourse[]>(this.loadFromStorage());
  
  public courses$: Observable<PurchasedCourse[]> = this.coursesSubject.asObservable();

  constructor() {}

  private loadFromStorage(): PurchasedCourse[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading purchased courses from storage', e);
      return [];
    }
  }

  private saveToStorage(courses: PurchasedCourse[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Error saving purchased courses to storage', e);
    }
  }

  getCourses(): PurchasedCourse[] {
    return this.coursesSubject.value;
  }

  addCourse(course: PurchasedCourse): void {
    const currentCourses = this.coursesSubject.value;
    // Verificar si el curso ya existe
    const exists = currentCourses.some(c => String(c.id) === String(course.id));
    if (exists) {
      console.warn('Course already purchased:', course.id);
      return;
    }
    
    const updatedCourses = [...currentCourses, course];
    this.coursesSubject.next(updatedCourses);
    this.saveToStorage(updatedCourses);
  }

  hasCourse(courseId: string | number): boolean {
    const courses = this.coursesSubject.value;
    return courses.some(c => String(c.id) === String(courseId));
  }

  updateProgress(courseId: string | number, progress: number): void {
    const courses = this.coursesSubject.value;
    const updated = courses.map(c => 
      String(c.id) === String(courseId) ? { ...c, progreso: progress } : c
    );
    this.coursesSubject.next(updated);
    this.saveToStorage(updated);
  }

  removeCourse(courseId: string | number): void {
    const courses = this.coursesSubject.value;
    const filtered = courses.filter(c => String(c.id) !== String(courseId));
    this.coursesSubject.next(filtered);
    this.saveToStorage(filtered);
  }
}
