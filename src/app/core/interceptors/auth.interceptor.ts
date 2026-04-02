import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
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
      if (error.status !== 401 || isPublicPath || isPasswordPath) {
        const message = errorMessage.processErrorResponse(error);
        toast.error(message);
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => {
            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              }),
            );
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

          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            }),
          );
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          const message = errorMessage.processErrorResponse(refreshErr);
          toast.error(message);
          authService.logoutWithReason(message);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
