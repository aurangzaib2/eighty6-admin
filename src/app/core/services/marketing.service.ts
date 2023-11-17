import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, DataTablesResponse } from '..';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  url: string = '/portal/promotion-request';
  constructor(private apiService: ApiService) { }

  /**
  * get all the requested promotion data of supplier
  * @param filter 
  * @returns 
  */
  geAllRequestedPromotionList(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`${this.url}/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * update the requested promotion
   * @param payload
   * @returns 
   */
  updateRequestPromotion(payload) {
    return this.apiService.post(`${this.url}/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
 * delete the requested promotion
 * @param payload
 * @returns 
 */
  deleteRequestPromotion(payload) {
    return this.apiService.post(`${this.url}/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /** 
   * accept/reject request promotion 
   */
  updateRequestPromotionAcceptReject(payload) {
    return this.apiService.post(`${this.url}/approve-reject/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  /**
   * get all the promotions ads/voucher
   */
  getAllPromotions(filter) {
    return this.apiService.post(`/portal/promotion/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  getAllSuppliers() {
    return this.apiService.get(`/portal/supplier/getSupplier`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  getAllRestaurants() {
    return this.apiService.get(`/portal/supplier/get-restaurants?&all=true`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * create a new promotion
   * @param payload 
   */
  createPromotion(payload) {
    return this.apiService.post(`/portal/promotion/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * update a promotion
   * @param payload 
   */
  updatePromotion(payload) {
    return this.apiService.post(`/portal/promotion/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * update the status of a promotion
   * @param payload 
   */
  updateStatusPromotion(payload) {
    return this.apiService.post(`/portal/promotion/status/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * delete a promotion
   * @param payload 
   */
  deletePromotion(payload) {
    return this.apiService.post(`/portal/promotion/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }


  /** 
   * get all the vouchers
  */
  getAllVouchers(filter) {
    return this.apiService.post(`/portal/voucher/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
 * create a new voucher
 * @param payload 
 */
  createVoucher(payload) {
    return this.apiService.post(`/portal/voucher/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * update a voucher
   * @param payload 
   */
  updateVoucher(payload) {
    return this.apiService.post(`/portal/voucher/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * update the status of a voucher
   * @param payload 
   */
  updateStatusVoucher(payload) {
    return this.apiService.post(`/portal/voucher/status/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * delete a voucher
   * @param payload 
   */
  deleteVoucher(payload) {
    return this.apiService.post(`/portal/voucher/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
}
