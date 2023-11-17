import { Injectable } from '@angular/core';
import { ApiService } from './index';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataTablesResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  url: string = '/portal/order';
  constructor(private apiService: ApiService) { }

  /**
   * get all the orders
   * @param filter 
   * @returns 
   */
  getAllOrders(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`${this.url}/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get order details
   * @param id 
   * @returns 
   */
  getOrderDetails(id, supplierId) {
    return this.apiService.get(`${this.url}/supplier-order/view/${id}?supplierId=${supplierId}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get order items
   * @param payload 
   * @returns 
   */
  getOrderItems(payload): Observable<DataTablesResponse> {
    return this.apiService.post(`${this.url}/order-items`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  
  getToken(payload) {
    return this.apiService.post(`${this.url}/getToken`, payload).pipe(map(data => {
        return data;
    }))
  }

  downloadInvoice(id:number, type:string): Observable<any> {

    return this.apiService.download(`/order/invoice/${id}?id=${id}&type=${type}`);    
  }
  deleteOrder(id): Observable<any> {
    return this.apiService.post(`${this.url}/delete-order/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
}
