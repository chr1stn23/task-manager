import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserCreateDTO } from '../../../shared/models/request/user-request.model';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import {
  UserListResponseDTO,
  UserResponseDTO,
} from '../../../shared/models/response/user-response.model';
import { Page } from '../../../shared/models/page.model';
import { buildHttpParams } from '../../../shared/utils/build-http-params';
import { ParamValue } from '../../../shared/types/http.types';

export interface GetUsersParams {
  page?: number;
  size?: number;

  sort?: string | string[];

  name?: string;
  email?: string;
  enabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/admin/users';

  createUser(request: UserCreateDTO): Observable<ApiResponseWrapper<UserResponseDTO>> {
    return this.http.post<ApiResponseWrapper<UserResponseDTO>>(this.API_URL, request);
  }

  getUsers(params: GetUsersParams): Observable<ApiResponseWrapper<Page<UserListResponseDTO>>> {
    return this.http.get<ApiResponseWrapper<Page<UserListResponseDTO>>>(this.API_URL, {
      params: buildHttpParams(params as Record<string, ParamValue>),
    });
  }

  getUserById(id: number): Observable<ApiResponseWrapper<UserResponseDTO>> {
    return this.http.get<ApiResponseWrapper<UserResponseDTO>>(`${this.API_URL}/${id}`, {});
  }

  disableUser(id: number): Observable<ApiResponseWrapper<string>> {
    return this.http.patch<ApiResponseWrapper<string>>(`${this.API_URL}/${id}/disable`, {});
  }

  enableUser(id: number): Observable<ApiResponseWrapper<string>> {
    return this.http.patch<ApiResponseWrapper<string>>(`${this.API_URL}/${id}/enable`, {});
  }
}
