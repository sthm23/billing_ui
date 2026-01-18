import { HttpClient } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, pipe, take, tap, throwError } from 'rxjs';
import { AuthRequest, AuthResponse } from '../../../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  refreshTokenInProgress = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  isLoggedIn = computed(() => !!this.getAccessToken());

  constructor(private http: HttpClient, private router: Router) { }

  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return token;
    }
    return null;
  }

  saveToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.asObservable();
    }
    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.http.get<AuthResponse>('/api/refresh', {
      withCredentials: true
    }).pipe( // Exclude this specific URL from the interceptor to avoid infinite loops
      tap((response) => {
        // Store the new access and refresh tokens
        this.saveToken(response.accessToken);
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError((err) => {
        this.refreshTokenInProgress = false;
        // If refresh fails (e.g., 403 Forbidden), log out the user
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['auth/login']);
    this.http.post('/api/logout', {}, {
      withCredentials: true
    }).pipe(take(1)).subscribe({});
  }


  login(body: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/login', body, {
      withCredentials: true
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
