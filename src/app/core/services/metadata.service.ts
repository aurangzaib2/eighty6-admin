import { Injectable } from '@angular/core';
import { ApiService } from '..';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataTablesResponse } from '..';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  constructor(private apiService: ApiService) { }

  /**
   * get global countries and product type
   * @returns {countries,productType}
   */
  getMetaData() {
    return this.apiService.get(`/portal/product-metadata/`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * get countries
   * @returns 
   */
  getCountries() {
    return this.apiService.get(`/shared/get-countries`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
  * get global company
  * @returns 
  */
  getCompany() {
    return this.apiService.get(`/shared/company`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
  * get global restaurant
  * @returns 
  */
  getRestaurants() {
    return this.apiService.get(`/shared/restaurants`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
* get stats data
* @param payload 
* @returns 
*/
  getStatics(payload) {
    return this.apiService.get(`/portal/order/stats?month=${payload.selectMonth}&currentMonth=${payload.currentMonth}&year=${payload.year}`).pipe(map(data => {
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
  getTopRestaurantList() {
    return this.apiService.get(`/portal/order/top-restaurant`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
  * get all suppliers listing
  * @param filter 
  * @returns 
  */
  getTopSuppliersList() {
    return this.apiService.get(`/portal/order/top-suppliers`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * get top selling categories
   * @returns 
   */
  getTopCategories() {
    return this.apiService.get(`/portal/order/top-categories`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  getNotificationList(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/notification/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  getUnReadNotificationCount(): Observable<DataTablesResponse> {
    return this.apiService.get(`/portal/notification/un-read-count`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  getUnReadNotificationList(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/notification/unread-listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  createNotification(payload) {
    return this.apiService.post(`/portal/notification/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  markAsReadNotification(payload) {
    return this.apiService.post(`/portal/notification/mark-read`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  globalSearch(term) {
    return this.apiService.get(`/portal/search/global-search`, term).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  convertToBase64(payload) {
    return this.apiService.post(`/shared/convertToBase64`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
}
