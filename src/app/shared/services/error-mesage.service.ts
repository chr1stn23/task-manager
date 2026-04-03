import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorResponse {
  code: string;
  message: string;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  timestamp: string;
  data: T | null;
  error?: ErrorResponse;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorMessagesService {
  private readonly errorMap: Record<string, string> = {
    NOT_FOUND: 'Recurso no encontrado',
    ACCESS_DENIED: 'No tienes permiso para acceder a este recurso',
    NICKNAME_ALREADY_EXISTS: 'El nombre de usuario ya está registrado',
    EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado',
    USER_DISABLED: 'El usuario está deshabilitado',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    REFRESH_TOKEN_REVOKED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    REFRESH_TOKEN_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  };

  getErrorMessage(errorCode: string, fallbackMessage?: string): string {
    return this.errorMap[errorCode] || fallbackMessage || 'Ocurrió un error inesperado';
  }

  processErrorResponse(error: HttpErrorResponse | ErrorResponse | Error | string | null): string {
    // 1. Error HTTP (Angular)
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error as ApiResponseWrapper<unknown>;

      // PRIORIDAD: backend error
      if (backendError?.error && this.isErrorWithCode(backendError.error)) {
        return this.getErrorMessage(backendError.error.code, backendError.error.message);
      }

      // fallback: status HTTP
      return this.processHttpError(error.status, error.message);
    }

    // 2. Error directo con code/message
    if (this.isErrorWithCode(error)) {
      return this.getErrorMessage(error.code, error.message);
    }

    // 3. Error JS
    if (error instanceof Error) {
      return error.message || 'Ocurrió un error inesperado';
    }

    // 4. string
    if (typeof error === 'string') {
      return error;
    }

    // oldPassword5. fallback
    return 'Ocurrió un error inesperado';
  }

  private isErrorWithCode(error: unknown): error is ErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as { code: unknown }).code === 'string' &&
      typeof (error as { message: unknown }).message === 'string'
    );
  }

  private processHttpError(status: number, message?: string): string {
    switch (status) {
      case 400:
        return 'Solicitud inválida';
      case 401:
        return 'No estás autorizado para realizar esta acción';
      case 403:
        return 'Acceso denegado';
      case 404:
        return 'Recurso no encontrado';
      case 409:
        return 'Conflicto con los datos existentes';
      case 422:
        return 'No se puede procesar la solicitud';
      case 500:
        return 'Error interno del servidor';
      case 502:
        return 'Error de servidor (Bad Gateway)';
      case 503:
        return 'Servicio no disponible';
      default:
        return message || 'Ocurrió un error inesperado';
    }
  }

  addErrorMapping(code: string, message: string): void {
    this.errorMap[code] = message;
  }

  addErrorMappings(mappings: Record<string, string>): void {
    Object.assign(this.errorMap, mappings);
  }
}
