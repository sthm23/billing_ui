import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { AuthRequest, AuthResponse, CurrentUserType, LogoutRequest } from '../../../models/auth.model';
import { Router } from '@angular/router';
import { LOCALE_STORAGE_KEYS } from '../../../models/app.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


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
      this.removeCurrentUser();
    }));
  }


  login(body: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/login', body, {
      withCredentials: true
    });
  }

  profile(): Observable<CurrentUserType> {
    return this.http.get<CurrentUserType>('/api/auth/me', {
      withCredentials: true
    }).pipe(tap((user) => {
      this.setCurrentUser(user);
    }));
  }

  setCurrentUser(user: CurrentUserType): void {
    localStorage.setItem(LOCALE_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  removeCurrentUser(): void {
    localStorage.removeItem(LOCALE_STORAGE_KEYS.USER);
  }

  getCurrentUser(): CurrentUserType | null {
    const user = localStorage.getItem(LOCALE_STORAGE_KEYS.USER);
    if (user) {
      return JSON.parse(user) as CurrentUserType;
    }
    return null;
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(LOCALE_STORAGE_KEYS.TOKEN);
    if (token) {
      return token;
    }
    return null;
  }

  saveToken(accessToken: string): void {
    localStorage.setItem(LOCALE_STORAGE_KEYS.TOKEN, accessToken);
  }

  removeToken(): void {
    localStorage.removeItem(LOCALE_STORAGE_KEYS.TOKEN);
  }

  redirectToLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
