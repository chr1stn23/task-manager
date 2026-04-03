import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, EMPTY } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ErrorMessagesService } from '../../shared/services/error-mesage.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const errorMessage = inject(ErrorMessagesService);

  const token = authService.currentUserToken();
  const url = req.url.toLowerCase();

  const isPublicPath =
    url.includes('auth/login') || url.includes('auth/register') || url.includes('auth/refresh');

  const isPasswordPath = url.includes('users/me/change-password');

  let authReq = req;

  if (token && !isPublicPath) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendCode = error.error?.error?.code;
      const is401 = error.status === 401;

      // CASOS TERMINALES (NO REFRESH)
      const nonRefreshable401 = [
        'USER_DISABLED',
        'INVALID_CREDENTIALS',
        'UNAUTHORIZED',
        'REFRESH_TOKEN_EXPIRED',
        'REFRESH_TOKEN_REVOKED',
      ];

      if (is401 && (!backendCode || nonRefreshable401.includes(backendCode))) {
        const message = errorMessage.processErrorResponse(error);
        toast.error(message);

        if (
          backendCode === 'USER_DISABLED' ||
          backendCode === 'REFRESH_TOKEN_EXPIRED' ||
          backendCode === 'REFRESH_TOKEN_REVOKED'
        ) {
          authService.logoutAndRedirect();
          return EMPTY;
        }

        return throwError(() => error);
      }

      // OTROS ERRORES (NO 401)
      if (!is401 || isPublicPath || isPasswordPath) {
        const message = errorMessage.processErrorResponse(error);
        toast.error(message);
        return throwError(() => error);
      }

      // SOLO REFRESH SI TOKEN EXPIRÓ
      const canRefresh = backendCode === 'EXPIRED_TOKEN';

      if (!canRefresh) {
        const message = errorMessage.processErrorResponse(error);
        toast.error(message);
        return throwError(() => error);
      }

      // REFRESH EN PROGRESO
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((t): t is string => t !== null),
          take(1),
          switchMap((newToken) =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              }),
            ),
          ),
        );
      }

      // INICIAR REFRESH
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((res) => {
          isRefreshing = false;

          if (!res.success || !res.data) {
            authService.logoutAndRedirect();
            return EMPTY;
          }

          const newToken = res.data.token;
          refreshTokenSubject.next(newToken);

          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            }),
          );
        }),
        catchError(() => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          authService.logoutAndRedirect();
          return EMPTY;
        }),
      );
    }),
  );
};
