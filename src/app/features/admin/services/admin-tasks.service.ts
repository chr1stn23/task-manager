import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import { TaskSummaryDTO } from '../../../shared/models/response/task-response.model';

@Injectable({ providedIn: 'root' })
export class AdminTasksService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/admin';

  getTaskUserSummary(userId: number): Observable<ApiResponseWrapper<TaskSummaryDTO>> {
    return this.http.get<ApiResponseWrapper<TaskSummaryDTO>>(
      `${this.API_URL}/users/${userId}/tasks/summary`,
      {},
    );
  }
}
