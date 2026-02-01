import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, take, tap, throwError } from 'rxjs';
import { AuthRequest, AuthResponse, LogoutRequest } from '../../../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  getAccessToken() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return token;
    }
    return null;
  }

  saveToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>('/api/refresh', {
      withCredentials: true
    }).pipe( // Exclude this specific URL from the interceptor to avoid infinite loops
      tap((response) => {
        // Store the new access and refresh tokens
        this.saveToken(response.accessToken);
      })
    );
  }

  logout(body: LogoutRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/logout', body, {
      withCredentials: true
    }).pipe(take(1), tap(() => {
      this.removeToken();
    }));
  }


  login(body: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/login', body, {
      withCredentials: true
    });
  }

  removeToken(): void {
    localStorage.removeItem('accessToken');
  }

  redirectToLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
