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

  authError = signal<string | null>(null);

  private readonly httpOptions = { withCredentials: true };

  register(data: RegisterRequestDTO): Observable<ApiResponseWrapper<AuthResponseDTO>> {
    this.authError.set(null);

    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/register', data, this.httpOptions)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((err) => {
          const errorCode = err?.error?.error?.code;
          switch (errorCode) {
            case 'EMAIL_ALREADY_EXISTS':
              this.authError.set('El correo ya está registrado');
              break;
            default:
              this.authError.set(err?.error?.error?.message ?? 'Ocurrió un error inesperado');
          }

          return of({
            success: false,
            data: null,
            error: {
              code: errorCode ?? 'UNKNOWN',
              message: err?.error?.error?.message ?? 'Error',
            },
            timestamp: new Date().toISOString(),
          });
        }),
      );
  }

  login(credentials: AuthRequestDTO): Observable<ApiResponseWrapper<AuthResponseDTO>> {
    this.authError.set(null);

    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/login', credentials, this.httpOptions)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError((err) => {
          const errorCode = err?.error?.error?.code;

          switch (errorCode) {
            case 'USER_DISABLED':
              this.authError.set('Tu cuenta está deshabilitada');
              break;
            case 'INVALID_CREDENTIALS':
              this.authError.set('Correo o contraseña incorrectos');
              break;
            default:
              this.authError.set(err?.error?.error?.message ?? 'Ocurrió un error inesperado');
          }

          return of({
            success: false,
            data: null,
            error: {
              code: errorCode ?? 'UNKNOWN',
              message: err?.error?.error?.message ?? 'Error',
            },
            timestamp: new Date().toISOString(),
          });
        }),
      );
  }

  refreshToken(): Observable<ApiResponseWrapper<AuthResponseDTO>> {
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/refresh', {}, this.httpOptions)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  private handleAuthResponse(response: ApiResponseWrapper<AuthResponseDTO>) {
    if (!response.success || !response.data) return;
    const token = response.data.token;
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUserToken.set(token);
    this.loadUserProfile().subscribe();
  }

  logout() {
    return this.http
      .post<ApiResponseWrapper<AuthResponseDTO>>('api/auth/logout', {}, this.httpOptions)
      .pipe(
        tap(() => this.cleanLocalAuth()),
        catchError(() => {
          this.cleanLocalAuth();
          return of({
            success: false,
            data: null,
            error: {
              code: 'LOGOUT_ERROR',
              message: 'Error al cerrar sesión',
            },
            timestamp: new Date().toISOString(),
          });
        }),
      );
  }

  logoutWithReason(reason: string) {
    this.cleanLocalAuth();
    this.authError.set(reason);
    this.router.navigate(['/login']);
  }

  loadUserProfile(): Observable<ApiResponseWrapper<UserResponseDTO>> {
    return this.http.get<ApiResponseWrapper<UserResponseDTO>>('api/users/me').pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
        }
      }),
      catchError((err) => {
        if (err.status === 401) this.cleanLocalAuth();

        return of({
          success: false,
          data: null,
          error: {
            code: 'USER_PROFILE_ERROR',
            message: 'No se pudo cargar el usuario',
          },
          timestamp: new Date().toISOString(),
        });
      }),
    );
  }

  private cleanLocalAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserToken.set(null);
    this.currentUser.set(null);
  }
}
