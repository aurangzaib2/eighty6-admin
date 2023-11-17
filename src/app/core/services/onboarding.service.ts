import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '.';
import { DataTablesResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  constructor(private apiService: ApiService) { }

  /**
   * get all the onboarding users
   * @param filter 
   * @returns 
  */
  getAllUsers(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/user/registrations`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * get supplier profile
   * @returns
  */
  getProfileSupplier(id) {
    return this.apiService.get(`/portal/supplier?supplierId=${id}`).pipe(map(data => {
      if (data && data.result) {
        // this.currentUserSubject.next(data.result);
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add new supplier
   * @param payload 
   * @returns 
   */
  addSupplier(payload) {
    return this.apiService.post('/portal/supplier/create', payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * update supplier
   * @param payload
   * @returns
   */
  updateSupplier(payload) {
    return this.apiService.post('/portal/supplier/update', payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * change the status of supplier(reject or approve)
   * @param payload 
   * @returns 
   */
  approveRejectSupplier(payload) {
    return this.apiService.post(`/portal/supplier/approve-reject`, payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * get restaurant profile
   * @returns
  */
  getProfileRestaurant(id) {
    return this.apiService.get(`/portal/restaurant/view/${id}`).pipe(map(data => {
      if (data && data.result) {
        // this.currentUserSubject.next(data.result);
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add new restaurant
   * @param payload
   * @returns
   */
  addRestaurant(payload) {
    return this.apiService.post('/portal/restaurant/create', payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * update restaurant
   * @param payload
   * @returns
   */
  updateRestaurant(payload) {
    return this.apiService.post(`/portal/restaurant/update/${payload.id}`, payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
 * change the status of restaurant(reject or approve)
 * @param payload 
 * @returns 
 */
  approveRejectRestaurant(payload) {
    return this.apiService.post(`/portal/restaurant/approve-reject`, payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * get company profile
   * @returns
  */
  getProfileCompany(id) {
    return this.apiService.get(`/portal/company/${id}`).pipe(map(data => {
      if (data && data.result) {
        // this.currentUserSubject.next(data.result);
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add new company
   * @param payload
   * @returns
   */
  addCompany(payload) {
    return this.apiService.post('/portal/company/create', payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * update company
   * @param payload
   * @returns
   */
  updateCompany(payload) {
    return this.apiService.post(`/portal/company/update/${payload.id}`, payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
  * change the status of company(reject or approve)
  * @param payload 
  * @returns 
  */
  approveRejectCompany(payload) {
    return this.apiService.post(`/portal/company/approve-reject`, payload).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
}
