import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentUserToken();

  const isAuthPath =
    req.url.toLowerCase().includes('auth/login') ||
    req.url.toLowerCase().includes('auth/refresh') ||
    req.url.toLowerCase().includes('auth/register');

  if (isAuthPath) {
    return next(req); // pasar directo, sin tocar
  }

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            const newToken = res.data.token;
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
              withCredentials: true,
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
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
      }

      return throwError(() => error);
    }),
  );
};
