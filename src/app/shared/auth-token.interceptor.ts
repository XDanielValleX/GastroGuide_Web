import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserSessionService } from './user-session.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private readonly userSession: UserSessionService, private readonly router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.userSession.getToken();
    const isAuthRequest = req.url.includes('/api/v1/auth');
    let authReq = req;

    if (token && !req.headers.has('Authorization') && !isAuthRequest) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.userSession.clearSession();
          this.router.navigate(['/login'], { queryParams: { expired: '1' } });
        }
        return throwError(() => error);
      })
    );
  }
}
