import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../pages/auth/service/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) { } // Use Injector to avoid circular dependencies

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.injector.get(AuthService);
    const accessToken = authService.getAccessToken();

    if (accessToken) {
      request = this.addTokenHeader(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/api/refresh')) { // Check for 401 and prevent infinite loops
          return this.handle401Error(request, next, authService);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, authService: AuthService) {
    if (!authService.refreshTokenInProgress) {
      return authService.refreshToken().pipe(
        switchMap((newAccessToken) => {
          return next.handle(this.addTokenHeader(request, newAccessToken));
        })
      );
    } else {
      // If a refresh is already in progress, queue the request
      return authService.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          return next.handle(this.addTokenHeader(request, authService.getAccessToken() || ''));
        })
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }
}
