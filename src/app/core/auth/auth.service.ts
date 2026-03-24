import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthRequestDTO, RegisterRequestDTO } from '../../shared/models/request/auth-request.model';
import { ApiResponseWrapper } from '../../shared/models/api-response.model';
import { AuthResponseDTO } from '../../shared/models/response/auth-response.model';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserResponseDTO } from '../../shared/models/response/user-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';

  currentUserToken = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  currentUser = signal<UserResponseDTO | null>(null);

  isAdmin = computed(() => this.currentUser()?.roles.includes('ROLE_ADMIN') ?? false);

  loginFeedback = signal<string | null>(null);

  private readonly httpOptions = { withCredentials: true };

  register(data: RegisterRequestDTO): Observable<ApiResponseWrapper<AuthResponseDTO>> {
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/register', data, this.httpOptions)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  login(credentials: AuthRequestDTO) {
    this.loginFeedback.set(null);
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/login', credentials, this.httpOptions)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  refreshToken(): Observable<ApiResponseWrapper<AuthResponseDTO>> {
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/refresh', {}, this.httpOptions)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  private handleAuthResponse(response: ApiResponseWrapper<AuthResponseDTO>) {
    if (response.success) {
      const token = response.data.token;
      localStorage.setItem(this.TOKEN_KEY, token);
      this.currentUserToken.set(token);
      this.loadUserProfile().subscribe();
    }
  }

  logout() {
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/logout', {}, this.httpOptions)
      .pipe(
        tap(() => this.cleanLocalAuth()),
        catchError(() => {
          this.cleanLocalAuth();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

  logoutWithReason(reason: string) {
    this.cleanLocalAuth();
    this.loginFeedback.set(reason);
    this.router.navigate(['/login']);
  }

  loadUserProfile(): Observable<ApiResponseWrapper<UserResponseDTO> | null> {
    return this.http.get<ApiResponseWrapper<UserResponseDTO>>('api/users/me').pipe(
      tap((response) => {
        if (response.success) {
          this.currentUser.set(response.data);
        }
      }),
      catchError((err) => {
        if (err.status === 401) this.cleanLocalAuth();
        return of(null);
      }),
    );
  }

  private cleanLocalAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserToken.set(null);
    this.currentUser.set(null);
  }
}
