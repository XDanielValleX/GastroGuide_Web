import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CourseItem {
  id: string | number;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private _courses$ = new BehaviorSubject<CourseItem[]>([]);
  get courses$() { return this._courses$.asObservable(); }

  constructor(private http: HttpClient) {
    // initial fetch silent
    this.refresh();
  }

  refresh() {
    const url = `${environment.apiUrl}/api/v1/courses/all`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        const list = resp?.data || resp?.courses || resp || [];
        const normalized = Array.isArray(list) ? list.map((c: any) => ({ id: c.id ?? c._id ?? c.courseId, title: c.title || c.name || 'Sin título' })) : [];
        this._courses$.next(normalized);
      },
      error: () => {
        // on error, keep whatever was there; optionally could fallback to empty
        // don't throw; leave current value
      }
    });
  }
}
