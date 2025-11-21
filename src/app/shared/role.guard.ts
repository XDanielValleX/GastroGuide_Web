import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserSessionService } from './user-session.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly userSession: UserSessionService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const required = (route.data?.['roles'] as string[] | undefined)?.map((r) => r.toUpperCase());
    if (!required || required.length === 0) {
      return of(true);
    }

    return this.userSession.ensureProfileLoaded().pipe(
      map((profile) => {
        if (!profile) {
          this.userSession.clearSession();
          return this.router.createUrlTree(['/login']);
        }
        const role = this.userSession.getRole(profile);
        if (role && required.includes(role)) {
          return true;
        }
        return this.router.createUrlTree(['/home2']);
      })
    );
  }
}
