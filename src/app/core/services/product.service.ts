import { Injectable } from '@angular/core';
import { ApiService } from './index';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url: string = '/portal/supplier-inventory/';
  constructor(private apiService: ApiService) { }
  /**
   * fetch all global categories
   * @returns
   */
  getGlobalCategories() {
    return this.apiService.get(`/shared/categories`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * fetch all global products by category
   * @returns 
   */
  getGlobalProduct(id) {
    return this.apiService.get(`/shared/products?categoryId=${id}`).pipe(map(data => {
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
    return this.apiService.post(`/portal/category/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * get global sub category
 * @param filter 
 * @returns 
 */
  getGlobalSubCategories(filter) {
    return this.apiService.get(`/shared/sub-categories`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get sub category with additional data
   * @param filter 
   * @returns 
   */
  getSubCategory(filter) {
    return this.apiService.post(`/portal/category/sub-listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add new category
   * @param payload 
   * @returns 
   */
  addCategory(payload) {
    return this.apiService.post(`/portal/category/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * update category
 * @param payload 
 * @returns 
 */
  updateCategory(payload) {
    return this.apiService.post(`/portal/category/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * block and unblock the category
   * @param payload 
   * @returns 
   */
  changeCategoryStatus(payload) {
    return this.apiService.post(`/portal/category/status/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * delete category by id and remove product by id
   * @param payload (category Id or product Id)
   * @returns 
   */
  deleteCategory(payload) {
    return this.apiService.post(`/portal/category/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }

  /**
   * to get all the products of a category
   * @param filter
   * @returns 
   */
  getProducts(filter) {
    return this.apiService.post(`/portal/product/listing`, filter).pipe(map(data => {
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
    return this.apiService.post(`/portal/product/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
  * To update a product
  * @param payload 
  * @returns 
  */
  updateProduct(payload) {
    return this.apiService.post(`/portal/product/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
  * To delete a product
  * @param payload 
  * @returns 
  */
  deleteProduct(payload) {
    return this.apiService.post(`/portal/product/delete/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
 * block and unblock the product
 * @param payload 
 * @returns 
 */
  changeProductStatus(payload) {
    return this.apiService.post(`/portal/product/status/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * to get all seller list whose selling a product
   * @param filter
   * @returns 
   */
  getProductSellerList(filter) {
    return this.apiService.post(`/portal/product/seller-listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * to get product details
   * @param filter
   * @returns 
   */
  getProductDetails(id, sid) {
    return this.apiService.get(`${this.url}view?productId=${id}&supplierId=${sid}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * to update stock of inventory
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
   * reject/approve a request for a product
   * @param payload 
   * @returns 
   */
  updateProductRequestStatus(payload) {
    return this.apiService.post(`/portal/supplier-request/approve-reject/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * view a request for a product
  * @param payload 
  * @returns 
  */
  viewRequestProduct(params) {
    return this.apiService.get(`/portal/supplier-request/view/${params}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * get all request product of supplier
   * @param payload 
   * @returns 
   */
  getAllRequestedProduct(filter) {
    return this.apiService.post(`/portal/supplier-request/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * update requested product
   * @param payload 
   * @returns 
   */
  updateRequestedProduct(payload) {
    return this.apiService.post(`/portal/supplier-request/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * delete requested product
   * @param payload 
   * @returns 
   */
  deleteRequestedProduct(payload) {
    return this.apiService.post(`/portal/supplier-request/delete/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * get product type
   * @returns 
   */
  getProductType() {
    return this.apiService.get(`/portal/product-type/listing`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add product type
   * @param payload 
   * @returns 
   */
  addProductType(payload) {
    return this.apiService.post(`/portal/product-type/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * update product type
 * @param payload 
 * @returns 
 */
  updateProductType(payload) {
    return this.apiService.post(`/portal/product-type/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * delete product type
  * @param payload 
  * @returns 
  */
  deleteProductType(payload) {
    return this.apiService.post(`/portal/product-type/delete/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }


  /**
 * get units
 * @returns 
 */
  getUnits() {
    return this.apiService.get(`/portal/units/listing`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add units
   * @param payload 
   * @returns 
   */
  addUnits(payload) {
    return this.apiService.post(`/portal/units/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * update units
 * @param payload 
 * @returns 
 */
  updateUnits(payload) {
    return this.apiService.post(`/portal/units/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * delete units
  * @param payload 
  * @returns 
  */
  deleteUnits(payload) {
    return this.apiService.post(`/portal/units/delete/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
 * get product type
 * @returns 
 */
  getPackaging() {
    return this.apiService.get(`/portal/packaging/listing`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * add product type
   * @param payload 
   * @returns 
   */
  addPackaging(payload) {
    return this.apiService.post(`/portal/packaging/create`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
 * update product type
 * @param payload 
 * @returns 
 */
  updatePackaging(payload) {
    return this.apiService.post(`/portal/packaging/update/${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
  * delete product type
  * @param payload 
  * @returns 
  */
  deletePackaging(payload) {
    return this.apiService.post(`/portal/packaging/delete/${payload.id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }
}
