import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface UserProfile {
    id?: string | number;
    name?: string;
    username?: string;
    email?: string;
    image?: string;
    avatar?: string;
    bio?: string;
    birthDate?: string;
    phone?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    role?: string;
    roles?: string[];
    active?: boolean;
    expiresIn?: number;
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
    private readonly userSubject = new BehaviorSubject<UserProfile | null>(this.restoreCachedUser());

    readonly user$ = this.userSubject.asObservable();

    constructor() { }

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

    ensureProfileLoaded(): Observable<UserProfile | null> {
        const snapshot = this.userSubject.value;
        if (snapshot && (snapshot.email || snapshot.id)) {
            return of(snapshot);
        }
        const restored = this.restoreCachedUser();
        if (restored) {
            this.userSubject.next(restored);
        }
        return of(restored);
    }

    updateProfile(patch: Partial<UserProfile>): Observable<UserProfile> {
        const merged = this.persistUser(patch);
        return of(merged);
    }

    persistUser(partial: Partial<UserProfile>): UserProfile {
        const normalized = this.normalizeIncomingProfile(partial);
        const merged = { ...(this.userSubject.value || {}), ...normalized } as UserProfile;
        if (merged.avatar && !merged.image) {
            merged.image = merged.avatar;
        } else if (merged.image && !merged.avatar) {
            merged.avatar = merged.image;
        }
        const tokenRole = this.extractRoleFromToken();
        if (tokenRole) {
            merged.role = tokenRole;
            if (Array.isArray(merged.roles)) {
                const normalizedRoles = merged.roles
                    .map((r) => this.normalizeRole(r || '') || (typeof r === 'string' ? r.toUpperCase() : ''))
                    .filter((r): r is string => !!r);
                if (!normalizedRoles.includes(tokenRole)) {
                    normalizedRoles.push(tokenRole);
                }
                merged.roles = normalizedRoles;
            } else {
                merged.roles = [tokenRole];
            }
        } else if (merged.role) {
            merged.role = this.normalizeRole(merged.role) || undefined;
        } else if (Array.isArray(merged.roles) && merged.roles.length) {
            const normalizedRoles = merged.roles
                .map((r) => this.normalizeRole(r || '') || (typeof r === 'string' ? r.toUpperCase() : ''))
                .filter((r): r is string => !!r);
            if (normalizedRoles.length) {
                merged.roles = normalizedRoles;
                merged.role = normalizedRoles[0];
            }
        }
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
            if (!cached) {
                return null;
            }
            const parsed = JSON.parse(cached) as UserProfile;
            const normalized = this.normalizeIncomingProfile(parsed);
            if (parsed?.role) {
                normalized.role = this.normalizeRole(parsed.role) || undefined;
            } else {
                const role = this.extractRoleFromToken();
                if (role) {
                    normalized.role = role;
                }
            }
            return normalized;
        } catch {
            return null;
        }
    }

    getRole(profile: UserProfile | null = this.userSubject.value): string | null {
        const normalizedProfileRole = profile?.role ? this.normalizeRole(profile.role) : null;
        const normalizedArrayRole = Array.isArray(profile?.roles) && profile.roles.length
            ? this.normalizeRole(profile.roles[0])
            : null;
        const tokenRole = this.extractRoleFromToken();

        if (tokenRole && tokenRole !== normalizedProfileRole) {
            return tokenRole;
        }
        if (normalizedProfileRole) {
            return normalizedProfileRole;
        }
        if (tokenRole && tokenRole !== normalizedArrayRole) {
            return tokenRole;
        }
        if (normalizedArrayRole) {
            return normalizedArrayRole;
        }
        return tokenRole;
    }

    private extractRoleFromToken(token?: string | null): string | null {
        const value = token ?? this.getToken();
        if (!value) {
            return null;
        }
        const payload = this.decodeToken(value);
        const roleClaim =
            payload?.role ||
            payload?.rol ||
            payload?.authorities?.[0] ||
            payload?.roles?.[0] ||
            payload?.claims?.role;
        if (!roleClaim) {
            return null;
        }
        return this.normalizeRole(roleClaim);
    }

    private normalizeRole(role?: string | null): string | null {
        if (!role) {
            return null;
        }
        return role.replace(/^ROLE_/i, '').trim().toUpperCase();
    }

    private decodeToken(token: string): any | null {
        try {
            const [, payload] = token.split('.');
            if (!payload) {
                return null;
            }
            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            if (typeof atob !== 'function') {
                return null;
            }
            const decoded = atob(normalized);
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }

    private normalizeIncomingProfile(profile?: Partial<UserProfile> | null): Partial<UserProfile> {
        if (!profile) {
            return {};
        }

        const normalized: Partial<UserProfile> = { ...profile };

        if (normalized.avatar && !normalized.image) {
            normalized.image = normalized.avatar;
        } else if (normalized.image && !normalized.avatar) {
            normalized.avatar = normalized.image;
        }

        if (Array.isArray(normalized.roles)) {
            normalized.roles = normalized.roles
                .map((role) => this.normalizeRole(role || '') || (typeof role === 'string' ? role.toUpperCase() : ''))
                .filter((role): role is string => !!role);
        }

        if (!normalized.phone && typeof normalized.phoneNumber === 'string') {
            normalized.phone = normalized.phoneNumber;
        }

        if (!normalized.birthDate && typeof normalized.dateOfBirth === 'string') {
            normalized.birthDate = normalized.dateOfBirth;
        }

        if (!normalized.name && normalized.username) {
            normalized.name = normalized.username;
        }

        if (!normalized.username && normalized.email) {
            normalized.username = normalized.email.split('@')[0];
        }

        return normalized;
    }
}
