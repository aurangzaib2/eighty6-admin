import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, DataTablesResponse } from '..';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '.';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  token: String;
  private httpClient: HttpClient;
  constructor(private apiService: ApiService, private jwtService: JwtService, handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
    this.token = this.jwtService.getToken();
  }
  /**
   * report list
   * @returns 
   */
  getReport(query) {
    return this.apiService.get(`/shared/report-list`, query).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  downloadReport(params, url) {
    let headers = new HttpHeaders({
      'Authorization': `JWT ${this.token}`,
      'Accept': 'application/json',
      'region': localStorage.getItem('region')
    });
    let path = `/portal/report/${url}?startDate=${params.startDate}`;
    if (params.endDate) {
      path += `&endDate=${params.endDate}`;
    }
    return this.httpClient.get(`${environment.app_url}${path}`, { headers, responseType: "blob" });
  }
}
