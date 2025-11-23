import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
  id: string | number;
  name?: string;
  email: string;
  createdAt: string;
  role?: string;
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private key = 'gg_users_v1';
  private _users$ = new BehaviorSubject<AppUser[]>(this.loadInitial());
  get users$() { return this._users$.asObservable(); }

  private loadInitial(): AppUser[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw) as AppUser[];
    } catch {}
    return [];
  }

  private persist(list: AppUser[]) {
    try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {}
  }

  addUser(payload: Partial<AppUser>) {
    const list = this._users$.getValue().slice();
    const nextId = list.length ? (Math.max(...list.map(u => typeof u.id === 'number' ? (u.id as number) : 0)) + 1) : 1;
    const item: AppUser = {
      id: payload.id ?? nextId,
      name: payload.name,
      email: payload.email || 'unknown',
      createdAt: payload.createdAt || new Date().toISOString()
    };
    list.unshift(item);
    this._users$.next(list);
    this.persist(list);
    return item;
  }

  updateFromStorage() {
    this._users$.next(this.loadInitial());
  }
}
