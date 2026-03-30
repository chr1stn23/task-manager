import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import { UserResponseDTO } from '../../../shared/models/response/user-response.model';
import { UserUpdateBySelfDTO } from '../../../shared/models/request/user-request.model';
import { PasswordChangeRequestDTO } from '../../../shared/models/request/password-request.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/users';

  getCurrentUser(): Observable<ApiResponseWrapper<UserResponseDTO>> {
    return this.http.get<ApiResponseWrapper<UserResponseDTO>>(`${this.API_URL}/me`);
  }

  updateCurrentUser(request: UserUpdateBySelfDTO): Observable<ApiResponseWrapper<UserResponseDTO>> {
    return this.http.patch<ApiResponseWrapper<UserResponseDTO>>(`${this.API_URL}/me`, request);
  }

  changePassword(request: PasswordChangeRequestDTO): Observable<ApiResponseWrapper<string>> {
    return this.http.post<ApiResponseWrapper<string>>(
      `${this.API_URL}/me/change-password`,
      request,
    );
  }

  uploadProfilePicture(file: File): Observable<ApiResponseWrapper<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponseWrapper<string>>(
      `${this.API_URL}/me/upload-picture`,
      formData,
    );
  }

  disableUser(): Observable<ApiResponseWrapper<string>> {
    return this.http.patch<ApiResponseWrapper<string>>(`${this.API_URL}/me/disable`, {});
  }
}
