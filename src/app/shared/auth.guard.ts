import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserSessionService } from './user-session.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly userSession: UserSessionService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const token = this.userSession.getToken();
    if (!token) {
      return of(this.redirectToLogin(state.url));
    }

    return this.userSession.ensureProfileLoaded().pipe(
      map((profile) => {
        if (profile) {
          return true;
        }
        this.userSession.clearSession();
        return this.redirectToLogin(state.url);
      })
    );
  }

  private redirectToLogin(url: string): UrlTree {
    return this.router.createUrlTree(['/login'], { queryParams: { redirectTo: url } });
  }
}
