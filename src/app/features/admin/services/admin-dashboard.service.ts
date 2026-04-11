import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseWrapper } from '../../../shared/models/api-response.model';
import { AdminDashboardDTO } from '../../../shared/models/response/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/admin';

  getDashboardStats(): Observable<ApiResponseWrapper<AdminDashboardDTO>> {
    return this.http.get<ApiResponseWrapper<AdminDashboardDTO>>(
      `${this.API_URL}/dashboard/stats`,
      {},
    );
  }
}
