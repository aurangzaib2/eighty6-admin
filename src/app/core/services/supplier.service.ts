import { Injectable } from '@angular/core';
import { ApiService } from './index';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DataTablesResponse } from '../models';
import { JwtService } from '..';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { formatErrors } from '../../helpers';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  url: string = '/portal/supplier-inventory/';
  private supplierData = new BehaviorSubject({});
  supplierData$ = this.supplierData.asObservable().pipe(distinctUntilChanged());
  token: String;
  private httpClient: HttpClient;
  constructor(private apiService: ApiService, private jwtService: JwtService, handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
    this.token = this.jwtService.getToken();
  }

  setSupplierData(data) {
    this.supplierData.next(data);
  }
  getData() {
    return this.supplierData.value;
  }
  /**
   * get all the users
   * @param filter 
   * @returns 
   */
  getAllSupplierUsers(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/supplier/listing`, filter).pipe(map(data => {
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
 * delete restaurant
 * @param id 
 * @returns 
 */
  deleteSupplier(id) {
    return this.apiService.post(`/portal/supplier/delete/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
 * update restaurant status
 * @param payload 
 * @returns 
 */
  updateStatus(payload) {
    return this.apiService.post(`/portal/supplier/status/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * to get all the categories
 * @param filter
 * @returns 
 */
  getCatalogueCategories(filter) {
    return this.apiService.get(`${this.url}getCatalogue${filter}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * fetch all global products
   * @returns 
   */
  getGlobalProduct() {
    return this.apiService.get(`/shared/products`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * To create a new product
   * @param payload 
   * @returns 
   */
  createProduct(payload) {
    return this.apiService.post(`${this.url}create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * to get all the products of a category or get discounted product of my inventory
   * @param filter
   * @returns 
   */
  getProducts(filter) {
    return this.apiService.get(`${this.url}listing` + filter).pipe(map(data => {
    //  if (data && data.result) {
        return data;
      // } else {
      //   return null;
      // }
    }));
  }
  /**
    * To update a product
    * @param payload 
    * @returns 
    */
  updateProduct(payload) {
    return this.apiService.post(`${this.url}update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * to get product details
   * @param filter
   * @returns 
   */
  updateProductStock(obj) {
    return this.apiService.post(`${this.url}${obj.inventoryId}/stock-update`, obj).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * delete product by id and remove product by id
   * @param payload (category Id or product Id)
   * @returns 
   */
  deleteProduct(payload) {
    return this.apiService.post(`${this.url}delete`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * get all the orders for a supplier
   * @param payload 
   * @returns 
   */
  getOrderList(payload) {
    return this.apiService.post(`/portal/order/supplier-orders`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  /**
   * get supplier order by id
   * @param id 
   * @returns 
   */
  getOrderById(id, supplierId) {
    return this.apiService.get(`/portal/order/supplier-order/view/${id}?supplierId=${supplierId}`,).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * get order items
   * @param payload 
   * @returns 
   */
  getOrderItems(payload): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/order/order-items`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
  * get QuantitySize from category and sub category and sub product name and brand names and origin and types and packaging id
  * @param params
  * @returns
  */
  getQuantitySize(params) {
    return this.apiService.get(`/portal/product/quantity-size`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get global sub categories from category for product
   * @param params 
   * @returns 
   */
  getProductSubCategory(params) {
    return this.apiService.get(`/portal/product/sub-category`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * get sub category of my catalogue
 * @param filter 
 * @returns 
 */
  getSubCategory(filter) {
    return this.apiService.post(`${this.url}get-sub-catalogue`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get brand names from category and sub category
   * @param params
   * @returns
   */
  getSubProduct(params) {
    return this.apiService.get(`/portal/product/sub-product`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get brand names from category and sub category and sub product name
   * @param params
   * @returns
   */
  getBrandNames(params) {
    return this.apiService.get(`/portal/product/brand-name`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get origins from category and sub category and sub product name and brand names
   * @param params
   * @returns
   */
  getOrigin(params) {
    return this.apiService.get(`/portal/product/origin`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get types from category and sub category and sub product name and brand names and origin
   * @param params
   * @returns
   */
  getTypes(params) {
    return this.apiService.get(`/portal/product/types`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get packaging from category and sub category and sub product name and brand names and origin and types
   * @param params
   * @returns
   */
  getPackaging(params) {
    return this.apiService.get(`/portal/product/packaging`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  getMarketList(filter) {
    return this.apiService.post(`/portal/supplier-inventory/special-price/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * add the supplier product 
  */
  addMarketList(payload) {
    return this.apiService.post(`/portal/supplier-inventory/special-price/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * update the supplier product 
  */
  updateMarketList(payload) {
    return this.apiService.post(`/portal/supplier-inventory/special-price/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * delete the supplier product 
 */
  deleteMarketList(id: number) {
    return this.apiService.post(`/portal/supplier-inventory/special-price/delete/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * get all the supplier product 
   */
  getSupplierProduct(params) {
    return this.apiService.get(`/shared/supplier-product`, params).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * get all the supplier product in excel
 */
  getSupplierProductExcel(payload) {
    let headers = new HttpHeaders({
      'Authorization': `JWT ${this.token}`,
      'Accept': 'application/json',
      'region': localStorage.getItem('region')
    });
    let path = `/portal/supplier-inventory/special-price/products?supplierId=${payload.supplierId}&restaurantId=${payload.restaurantId}`;
    return this.httpClient.get(`${environment.app_url}${path}`, { headers, responseType: "blob" });
  }

  setRestaurants(restaurants, supplierId) {
    return this.apiService.post(`/portal/supplier/set-restaurants?supplierId=${supplierId}`, restaurants).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  setSupplierRestaurant(payload) {
    return this.apiService.post(`/portal/supplier-restaurant/add`,payload).pipe(map(data => {
      if (data) {
        return data;
      } else {
        return null;
      }
    }));
  }
  SupplierRestaurantListing(payload) {
    return this.apiService.get(`/portal/supplier-restaurant/listing-all?supplierId=${payload}`).pipe(map(data => {
      if (data) {
        return data.data;
      } else {
        return null;
      }
    }));
  }
  deleteSupplierRestaurant(payload) {
    return this.apiService.post(`/portal/supplier-restaurant/delete`,payload).pipe(map(data => {
      if (data) {
        return data;
      } else {
        return null;
      }
    }));
  }
  getRestaurants(supplierId) {
    return this.apiService.get(`/portal/supplier/restaurants?supplierId=${supplierId}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
}
