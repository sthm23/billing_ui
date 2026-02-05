import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../pages/auth/service/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private exitCode: Record<string, string> = {
    '401': 'UNAUTHORIZED'
  }
  constructor(
    private authService: AuthService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
    });

    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !request.url.includes('api/signin') &&
          !request.url.includes('api/refresh') &&
          !request.url.includes('api/logout') &&
          error.status === 401
        ) {
          return this.handle401Error(request, next);
        }
        if (request.url.includes('api/logout')) {
          this.authService.removeToken();
          this.authService.removeCurrentUser();
          this.authService.redirectToLogin();
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      if (this.authService.getAccessToken()) {
        return this.authService.refreshToken().pipe(
          switchMap((res) => {
            this.isRefreshing = false;
            this.authService.saveToken(res.accessToken);
            return next.handle(request);
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (this.exitCode[error.status]) {
              return this.authService.logout({
                isAllDevices: true,
                sessionId: this.authService.getAccessToken() || ''
              }).pipe(
                mergeMap(() => {
                  this.authService.removeToken();
                  this.authService.redirectToLogin();
                  this.authService.removeCurrentUser();
                  return EMPTY;
                })
              );
            }
            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
}
