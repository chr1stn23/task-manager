import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentUserToken();

  const isAuthPath =
    req.url.toLowerCase().includes('auth/login') ||
    req.url.toLowerCase().includes('auth/refresh') ||
    req.url.toLowerCase().includes('auth/register');

  if (isAuthPath) return next(req);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
        );
      }

      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((res) => {
          isRefreshing = false;

          if (!res.success || !res.data) {
            authService.logoutWithReason('Sesión expirada');
            return throwError(() => new Error('Refresh inválido'));
          }

          const newToken = res.data.token;

          refreshTokenSubject.next(newToken);

          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });

          return next(retryReq);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);

          const errorCode = refreshErr.error?.error?.code;

          const messages: Record<string, string> = {
            REFRESH_TOKEN_REVOKED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            REFRESH_TOKEN_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          };

          const message = messages[errorCode] ?? 'Sesión expirada';
          authService.logoutWithReason(message);

          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
