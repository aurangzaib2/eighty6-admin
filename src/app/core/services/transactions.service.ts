import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, DataTablesResponse } from '..';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  url: string = '/portal/transaction';
  constructor(private apiService: ApiService) { }

  /**
  * get all the transactions
  * @param filter 
  * @returns 
  */
  getAllTransactions(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`${this.url}/list`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
}
