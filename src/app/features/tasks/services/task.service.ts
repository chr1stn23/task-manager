import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Priority, TaskStatus } from '../../../shared/models/enums';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import { TaskResponseDTO } from '../../../shared/models/response/task-response.model';
import { Page } from '../../../shared/models/page.model';
import { TaskRequestDTO } from '../../../shared/models/request/task-request.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/tasks';

  getTasks(
    deleted?: boolean,
    status?: TaskStatus,
    priority?: Priority,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponseWrapper<Page<TaskResponseDTO>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (deleted !== undefined) params = params.set('deleted', deleted);
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<ApiResponseWrapper<Page<TaskResponseDTO>>>(this.API_URL, { params });
  }

  getTaskById(id: number): Observable<ApiResponseWrapper<TaskResponseDTO>> {
    return this.http.get<ApiResponseWrapper<TaskResponseDTO>>(`${this.API_URL}/${id}`);
  }

  createTask(request: TaskRequestDTO): Observable<ApiResponseWrapper<TaskResponseDTO>> {
    return this.http.post<ApiResponseWrapper<TaskResponseDTO>>(this.API_URL, request);
  }

  updateTask(id: number, request: TaskRequestDTO): Observable<ApiResponseWrapper<TaskResponseDTO>> {
    return this.http.put<ApiResponseWrapper<TaskResponseDTO>>(`${this.API_URL}/${id}`, request);
  }

  deleteTask(id: number): Observable<ApiResponseWrapper<string>> {
    return this.http.patch<ApiResponseWrapper<string>>(`${this.API_URL}/${id}/delete`, {});
  }

  restoreTask(id: number): Observable<ApiResponseWrapper<string>> {
    return this.http.patch<ApiResponseWrapper<string>>(`${this.API_URL}/${id}/restore`, {});
  }
}
