import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
  api_url = environment.app_url;
  constructor(
    private http: HttpClient,
  ) { }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${this.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  download(path: string): Observable<any> {
    return this.http.get<Blob>(`${this.api_url}${path}`, { 
      responseType: 'blob' as 'json',
      observe: 'response',
     });
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${this.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${this.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${this.api_url}${path}`
    ).pipe(catchError(this.formatErrors));
  }


  private formatErrors(error: any) {
    if (error && (error.status === 403 || error.status === 401)) {
      // location.reload();
    }
    let err = error.error;
    if (err.error) {
      err = err.error;
      if (err && err.error_params && err.error_params.length > 0) {
        const errors = err.error_params.map(e => e.msg);
        return throwError(errors || ['Oops something went wrong!']);
      } else if (err && err.errors && err.errors.length > 0) {
        return throwError(err.errors || ['Oops something went wrong!']);
      } else {
        return throwError(['Oops something went wrong!']);
      }
    } else {
      return throwError(err ? err.errors ? err.errors : 'Oops something went wrong!' : 'Oops something went wrong!');
    }
  }
}
