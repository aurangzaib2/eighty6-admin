import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { DataTablesResponse } from '..';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  url: string = '/portal/ticket';

  constructor(private apiService: ApiService , private httpClient : HttpClient ) { }

  // get all department (tickets types)
  getAllTicketTypes() {
    return this.apiService.get(`${this.url}/ticket-types`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  // get all the tickets
  getAllTickets(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`${this.url}/list`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  // add new tickets
  addTicket(payload) {
    return this.apiService.post(`${this.url}/new`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  // add new tickets

  
  getTicket(id) {
    return this.apiService.get(`${this.url}/details/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  getTicketCommentList(id)
  {
    return this.apiService.get(`${this.url}/comment-list/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  // close tickets
  closeTicket(payload) {
    return this.apiService.get(`${this.url}/close`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  addCommentForTicket(payload)
  {
    return this.apiService.post(`${this.url}/new/comment`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }


  changeTicketStatus(id,payload)
  {
    return this.apiService.post(`${this.url}/status/${id}` , payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  // upload attachment
  // uploadAttachment(payload) {
  //     const httpHeaders = {
  //       headers: new HttpHeaders({
  //         'Authorization': `Zoho-oauthtoken ${this.token}`,
  //         'Accept': 'application/json',
  //         'enctype': 'multipart/form-data'
  //       })
  //     };
  //     return this.httpClient.post(`${this.url}uploads`, payload, httpHeaders).pipe(map(data => {
  //       return data ? data : null;
  //     }));
  // }
}
