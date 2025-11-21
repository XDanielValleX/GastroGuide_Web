import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserProfile {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    image?: string;
    bio?: string;
    birthDate?: string;
    phone?: string;
    gender?: string;
    address?: string;
    role?: string;
    joined?: string;
    courses?: number;
    videos?: number;
    badges?: number;
    recipes?: number;
    achievements?: string[];
    [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class UserSessionService {
    private readonly storageKey = 'user';
    private readonly endpoint = `${environment.apiUrl}/api/v1/users/me`;
    private readonly userSubject = new BehaviorSubject<UserProfile | null>(this.restoreCachedUser());

    readonly user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) { }

    get snapshot(): UserProfile | null {
        return this.userSubject.value;
    }

    getToken(): string | null {
        const token = localStorage.getItem('token');
        if (token) {
            return token;
        }

        const auth = localStorage.getItem('auth');
        if (auth) {
            try {
                const parsed = JSON.parse(auth);
                return (
                    parsed?.token ||
                    parsed?.accessToken ||
                    parsed?.access_token ||
                    parsed?.data?.token ||
                    null
                );
            } catch {
                return null;
            }
        }

        return null;
    }

    refreshFromApi(): Observable<UserProfile | null> {
        const token = this.getToken();
        if (!token) {
            return of(this.userSubject.value);
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<UserProfile>(this.endpoint, { headers }).pipe(
            tap((profile) => this.persistUser(profile)),
            catchError((err) => {
                console.warn('No se pudo actualizar el perfil desde la API.', err);
                return of(this.userSubject.value);
            })
        );
    }

    updateProfile(patch: Partial<UserProfile>): Observable<UserProfile> {
        const token = this.getToken();
        if (!token) {
            return throwError(() => new Error('No hay token de autenticación. Inicia sesión nuevamente.'));
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.put<UserProfile>(this.endpoint, patch, { headers }).pipe(
            tap((profile) => this.persistUser(profile))
        );
    }

    persistUser(partial: Partial<UserProfile>): UserProfile {
        const merged = { ...(this.userSubject.value || {}), ...partial } as UserProfile;
        this.userSubject.next(merged);
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(merged));
        } catch { }
        return merged;
    }

    clearSession() {
        this.userSubject.next(null);
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('token');
            localStorage.removeItem('auth');
            sessionStorage.clear();
        } catch { }
    }

    private restoreCachedUser(): UserProfile | null {
        try {
            const cached = localStorage.getItem(this.storageKey);
            return cached ? (JSON.parse(cached) as UserProfile) : null;
        } catch {
            return null;
        }
    }
}
