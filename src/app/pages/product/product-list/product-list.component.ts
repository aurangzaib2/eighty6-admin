import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class ProductListComponent implements OnInit {

  categoryData = { id: null, name: null, subCategoryId: null, subCategoryName: null };
  dataList = [];
  search: string = '';
  start: number = 0;
  length: number = 12;
  maxLength: number = 0;
  selectedLang: string;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private router: Router,
    private route: ActivatedRoute, private location: Location, private productService: ProductService, private spinner: SpinnerService,
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
  getProducts() {
    let query = {
      categoryId: this.categoryData.id,
      subCategoryId: this.categoryData.subCategoryId,
      search: this.search,
      start: this.start,
      length: this.length
    };
    this.productService.getProducts(query).subscribe(result => {
      let arr = (result.rows)
      let newSet = new Set(arr);
      this.dataList = [...newSet];
      this.maxLength = result.count;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }
  searchData() {
    if (this.search != null || this.search != '') {
      this.dataList = [];
      this.start = 0;
      this.getProducts();
    }
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (this.maxLength >= this.length) {
      this.length += this.length;
      this.getProducts();
    }
  }
  /**
   * open modal of product
   */
  open() {
    const modalRef = this.modalService.open(ProductFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.catId = this.categoryData.id;
    modalRef.componentInstance.subCatId = this.categoryData.subCategoryId;

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
    item.categoryId = this.categoryData.id;
    const modalRef = this.modalService.open(ProductFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.productData = item;
    modalRef.componentInstance.type = 'edit';
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.dataList = [];
      this.start = 0;
      this.getParams();
    })
  }

  /**
  * open modal to confirm hide
  */
  openConfirmHide(item) {
    let text = item.status == 'active' ? 'hide' : 'un-hide'
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = text + ' ' + 'Product';
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this product ?`;
    modalRef.componentInstance.okText = 'Yes';
    modalRef.componentInstance.cancelText = 'No';
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.hideRequest(item);
    })
  }
  /**
  * hide category request
  * @param item 
  */
  hideRequest(item) {
    this.spinner.start();
    this.productService.changeProductStatus(item).subscribe(result => {
      this.toastService.success(result.message);
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
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle') +` `+this.translate.instant('confirmMessages.product');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+ this.translate.instant('confirmMessages.thisProduct')+` ?`;
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
    this.productService.deleteProduct(item).subscribe(result => {
      this.toastService.success(result.message);
      this.dataList = [];
      this.start = 0;
      this.getParams();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }

  navigateToProductView(value) {
    let query = { pid: value.id, pn: value.displayName };
    this.router.navigate([`/product/${this.categoryData.id}/${this.categoryData.name}//${this.categoryData.subCategoryId}/${this.categoryData.subCategoryName}/seller-list`], { queryParams: query });
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
