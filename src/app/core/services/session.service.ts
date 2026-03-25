import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../shared/models/api-response.model';
import { SessionResponseDTO } from '../../shared/models/response/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/sessions';
  private readonly httpOptions = { withCredentials: true };

  getSessions(): Observable<ApiResponseWrapper<SessionResponseDTO[]>> {
    return this.http.get<ApiResponseWrapper<SessionResponseDTO[]>>(this.API_URL, this.httpOptions);
  }

  revokeSession(id: number): Observable<ApiResponseWrapper<string>> {
    return this.http.delete<ApiResponseWrapper<string>>(`${this.API_URL}/${id}`);
  }

  revokeAllSessions(): Observable<ApiResponseWrapper<string>> {
    return this.http.delete<ApiResponseWrapper<string>>(`${this.API_URL}`);
  }
}
