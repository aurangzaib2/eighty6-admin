import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { formatErrors, OPTIONS } from "../../helpers";

@Injectable()
export class UploadService {
  token: String;
  private httpClient: HttpClient;

  constructor(private jwtService: JwtService, private apiService: ApiService, handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
    this.token = this.jwtService.getToken();
  }


  uploadFile(formData, token?:string,isNew: boolean = false, id: string = "",): Observable<any> {
    const httpHeaders = {
      headers: new HttpHeaders({
        'Authorization': `JWT ${this.token}`,
        'Accept': 'application/json',
        'enctype': 'multipart/form-data',
        'region': localStorage.getItem('region'),
        'token': token,

      })
    };
    let path = '/shared/upload';
    return this.httpClient.post(`${environment.app_url}${path}`, formData, httpHeaders)
      .pipe(catchError(formatErrors))
      .pipe(map(data => {
        if (data) {
          return data;
        } else {
          return null;
        }
      }));
  };
  fileCheck(formData, isNew: boolean = false, id: string = ""): Observable<any> {
    const httpHeaders = {
      headers: new HttpHeaders({
        'Authorization': `JWT ${this.token}`,
        'Accept': 'application/json',
        'enctype': 'multipart/form-data',
        'region': localStorage.getItem('region')
      })
    };
    let path = '/shared/scan-file';
    return this.httpClient.post(`${environment.app_url}${path}`, formData, httpHeaders)
      .pipe(catchError(formatErrors))
      .pipe(map(data => {
        if (data) {
          return data;
        } else {
          return null;
        }
      }));
  };

  bulkUpload(formData, id: number): Observable<any> {
    const httpHeaders = {
      headers: new HttpHeaders({
        'Authorization': `JWT ${this.token}`,
        'Accept': 'application/json',
        'enctype': 'multipart/form-data',
        'region': localStorage.getItem('region')
      })
    };
    let path = `/portal/supplier-inventory/bulk-upload/${id}`;
    return this.httpClient.post(`${environment.app_url}${path}`, formData, httpHeaders)
      .pipe(catchError(formatErrors))
      .pipe(map(data => {
        if (data) {
          return data;
        } else {
          return null;
        }
      }));
  };

  /**
   * get all the supplier product 
   */
  bulkUploadMarketList(formData) {
    const httpHeaders = {
      headers: new HttpHeaders({
        'Authorization': `JWT ${this.token}`,
        'Accept': 'application/json',
        'enctype': 'multipart/form-data',
        'region': localStorage.getItem('region')
      })
    };
    let path = `/portal/supplier-inventory/special-price/bulk-upload`;
    return this.httpClient.post(`${environment.app_url}${path}`, formData, httpHeaders)
      .pipe(catchError(formatErrors))
      .pipe(map(data => {
        if (data) {
          return data;
        } else {
          return null;
        }
      }));
  }
  /**
   * check th file size
   * @param file 
   * @returns 
   */
  checkFileSize(file) {
    let size = file.size / (1024 * 1024);
    if (size >= OPTIONS.maxLimit) {
      return true;
    }
    return false;
  }
  /**
   * check upload file type
   * @param file
   * @returns
   */
  checkDocumentType(file) {
    let types = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!types.includes(file.type)) {
      return true;
    }
    return false;
  }
  /**
  * check upload file type
  * @param file 
  * @returns 
  */
  checkImageType(file) {
    let types = ['image/png', 'image/jpeg'];
    if (!types.includes(file.type)) {
      return true;
    }
    return false
  }

  /**
  * check upload file type
  * @param file 
  * @returns 
  */
  checkExcel(file) {
    let types = ['.csv', '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!types.includes(file.type)) {
      return true;
    }
    return false
  }

  checkHeightWidth(width, height) {
    if (width >= 500 || height >= 500) {
      return true;
    }
    return false;
  }
}
