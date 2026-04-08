import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import { SessionResponseDTO } from '../../../shared/models/response/session-response.model';

@Injectable({ providedIn: 'root' })
export class AdminSessionsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/admin';

  getSessionsByUserId(userId: number): Observable<ApiResponseWrapper<SessionResponseDTO[]>> {
    return this.http.get<ApiResponseWrapper<SessionResponseDTO[]>>(
      `${this.API_URL}/users/${userId}/sessions`,
      {},
    );
  }

  revokeAllSessions(userId: number): Observable<ApiResponseWrapper<string>> {
    return this.http.delete<ApiResponseWrapper<string>>(
      `${this.API_URL}/users/${userId}/sessions`,
      {},
    );
  }

  revokeSession(userId: number, sessionId: number): Observable<ApiResponseWrapper<string>> {
    return this.http.delete<ApiResponseWrapper<string>>(
      `${this.API_URL}/users/${userId}/sessions/${sessionId}`,
      {},
    );
  }
}
