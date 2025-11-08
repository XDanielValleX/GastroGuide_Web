import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage { text: string; type?: 'info' | 'success' | 'error' }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new BehaviorSubject<ToastMessage | null>(null);
  readonly messages$ = this.subject.asObservable();

  show(text: string, type: ToastMessage['type'] = 'info'){
    this.subject.next({ text, type });
    // clear after 3s
    setTimeout(()=> this.clear(), 3000);
  }

  clear(){ this.subject.next(null) }
}
