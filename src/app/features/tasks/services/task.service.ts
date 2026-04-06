import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Priority, TaskStatus } from '../../../shared/models/enums';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import {
  TaskResponseDTO,
  TaskSummaryDTO,
} from '../../../shared/models/response/task-response.model';
import { Page } from '../../../shared/models/page.model';
import { TaskRequestDTO } from '../../../shared/models/request/task-request.model';
import { buildHttpParams } from '../../../shared/utils/build-http-params';
import { ParamValue } from '../../../shared/types/http.types';

export interface GetTasksParams {
  page?: number;
  size?: number;

  sort?: string | string[];

  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  deleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/tasks';

  getTasks(params: GetTasksParams): Observable<ApiResponseWrapper<Page<TaskResponseDTO>>> {
    return this.http.get<ApiResponseWrapper<Page<TaskResponseDTO>>>(this.API_URL, {
      params: buildHttpParams(params as Record<string, ParamValue>),
    });
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

  getMyTaskSummary(): Observable<ApiResponseWrapper<TaskSummaryDTO>> {
    return this.http.get<ApiResponseWrapper<TaskSummaryDTO>>(`${this.API_URL}/summary`);
  }
}
