import { HttpParams } from '@angular/common/http';
import { ParamValue } from '../types/http.types';

export function buildHttpParams(params: Record<string, ParamValue>): HttpParams {
  let httpParams = new HttpParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        httpParams = httpParams.append(key, String(v));
      });
    } else {
      httpParams = httpParams.set(key, String(value));
    }
  });

  return httpParams;
}
