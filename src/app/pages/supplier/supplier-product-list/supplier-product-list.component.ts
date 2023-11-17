import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { SupplierProductFormComponent } from '../supplier-product-form/supplier-product-form.component';

@Component({
  selector: 'app-supplier-product-list',
  templateUrl: './supplier-product-list.component.html',
  styleUrls: ['./supplier-product-list.component.scss']
})
export class SupplierProductListComponent implements OnInit {

  categoryData = { id: null, name: null, subCategoryId: null, subCategoryName: null, image: null };
  dataList = [];
  search: string = '';
  supplierId: string = null;
  start: number = 0;
  length: number = 12;
  currency = localStorage.getItem('currency');
  maxLength: number = 0;
  selectedLang: string;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private router: Router,
    private route: ActivatedRoute, private location: Location, private supplierService: SupplierService, private spinner: SpinnerService,
    private toastService: ToastService, public translate: TranslateService) {
    config.placement = 'bottom-center';
    config.autoClose = true;

    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.getParams();
    this.selectedLang = localStorage.getItem('language');
  }
  /**
   * get params from url
   */
  getParams() {
    this.spinner.start();
    this.supplierId = this.route.snapshot.queryParams['id'];
    this.route.paramMap.subscribe(params => {
      if (params.get('id')) {
        this.categoryData.id = params.get('id');
        this.categoryData.name = params.get('name');
        this.categoryData.subCategoryId = params.get('id2');
        this.categoryData.subCategoryName = params.get('name2');
        this.getProducts();
      }
      else {
        // this.goBack();
      }
    });
  }
  /**
   * get all the products
   */
  getProducts(search?:any) {
    if (!search) {
      search = '';
    }
    let query = `?categoryId=${this.categoryData.id}&subCategoryId=${this.categoryData.subCategoryId}&start=${this.start}&length=${this.length}&search=${search}&supplierId=${this.supplierId}`;
    this.supplierService.getProducts(query).subscribe(result => {
      let arr = (result.product)
      let newSet = new Set(arr);
      this.dataList = [...newSet];
      this.maxLength = result.count;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (this.maxLength >= this.length) {
      this.length += this.length;
      this.getProducts();
    }
  }
  searchData() {
    if (this.search != null || this.search != '') {
      this.dataList = [];
      this.start = 0;
      this.getProducts();
    }
  }
  /**
   * open modal of product
   */
  open() {
    const modalRef = this.modalService.open(SupplierProductFormComponent, { centered: true, size: 'lg' });
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.dataList = [];
      this.start = 0;
      this.getParams();
    })
  }
  /**
   *  modal for edit product
   */
  edit(item) {
    item.categoryName = this.categoryData.name;
    const modalRef = this.modalService.open(SupplierProductFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.productData = item;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.dataList = [];
      this.start = 0;
      this.getParams();
    })
  }


  /**
 * open modal to confirm out of stock
 */
  openConfirmStock(item) {
    let text = item.inStock ? this.translate.instant('confirmMessages.outOfStock') : this.translate.instant('confirmMessages.inStock')
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.stockTitle');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.stockDescription') + `${text} ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.stockRequest(item);
    })
  }
  /**
  * out of stock request
  * @param item 
  */
  stockRequest(item) {
    this.spinner.start();
    let obj = {
      inventoryId: item.id,
      inStock: item.inStock ? false : true
    }
    this.supplierService.updateProductStock(obj).subscribe(result => {
      this.toastService.success(result);
      this.dataList = [];
      this.start = 0;
      this.getParams();
    }, error => {
      ;
      this.spinner.stop();
      this.toastService.error(error);
    })
  }

  /**
* open modal to confirm delete
*/
  openConfirmDelete(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription')+` `+this.translate.instant('confirmMessages.thisProduct')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.deleteRequest(item);
    })
  }
  /**
  * delete category request
  * @param item 
  */
  deleteRequest(item) {
    this.spinner.start();
    let obj = {
      productId: item.productId,
      categoryId: item.categoryId,
      previousStatus: item.status,
      supplierId: this.supplierId
    }
    this.supplierService.deleteProduct(obj).subscribe(result => {
      this.toastService.success(result.message);
      this.dataList = [];
      this.start = 0;
      this.getParams();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }

  goBack() {
    this.location.back();
  }
  goBackTwice() {
    window.history.go(-2);
  }
  goBackThrice() {
    window.history.go(-3);
  }
}
