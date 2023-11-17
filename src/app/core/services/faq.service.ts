import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  url: string = '/portal/faq';
  constructor(private apiService: ApiService) { }

  /**
   * get all faqs
   * @param filter 
   * @returns 
   */
  getAllFaqs(filter) {
    return this.apiService.post(`${this.url}/list`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
 * add new faqs
 * @param filter 
 * @returns 
 */
  addFaqs(payload) {
    return this.apiService.post(`${this.url}/new`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
  * update faqs
  * @param filter 
  * @returns 
  */
  updateFaqs(payload) {
    return this.apiService.post(`${this.url}/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * delete faqs
  * @param filter 
  * @returns 
  */
  deleteFaqs(payload) {
    return this.apiService.post(`${this.url}/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * update status faqs
  * @param filter 
  * @returns 
  */
  updateStatusFaqs(payload) {
    return this.apiService.post(`${this.url}/status/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
}
