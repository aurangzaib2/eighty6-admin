import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from '.';
import { DataTablesResponse } from '..';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private restaurantData = new BehaviorSubject({});
  restaurantData$ = this.restaurantData.asObservable().pipe(distinctUntilChanged());
  constructor(private apiService: ApiService) { }

  setRestaurantData(data) {
    this.restaurantData.next(data);
  }
  getData() {
    return this.restaurantData.value;
  }
  /**
   * update company status
   * @param payload 
   * @returns 
   */
  updateCompanyStatus(payload) {
    return this.apiService.post(`/portal/company/status/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * delete restaurant
 * @param id 
 * @returns 
 */
  deleteCompany(id) {
    return this.apiService.post(`/portal/company/delete/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * delete restaurant
   * @param id 
   * @returns 
   */
  deleteRestaurant(id) {
    return this.apiService.post(`/portal/restaurant/delete/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
 * get all restaurant listing
 * @param filter 
 * @returns 
 */
  getCompanyList(filter?): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/company/listing-v2`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  getCompanyListDropDown() {
    return this.apiService.get(`/portal/supplier/get-companies?all=true`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * get all the users
   * @param filter 
   * @returns 
   */
  getAllUsers(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/restaurant/users`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * add user to restaurant
   * @param payload 
   * @returns 
   */
  addRestaurantUser(payload) {
    return this.apiService.post(`/portal/restaurant/add-user`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * update restaurant user 
   * @param payload 
   * @returns 
   */
  updateRestaurantUser(payload) {
    return this.apiService.post(`/portal/restaurant/update-user`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * update restaurant status
   * @param payload 
   * @returns 
   */
  updateRestaurantStatus(payload) {
    return this.apiService.post(`/portal/restaurant/status/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get all restaurant listing
   * @param filter 
   * @returns 
   */
  getRestaurantList(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/restaurant/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
}
