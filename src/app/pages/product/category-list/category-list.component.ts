import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ProductService } from '../../../core/services/product.service';
import { AlertModalComponent } from '../../../shared';
import { confirmMessages } from '../../../helpers';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class CategoryListComponent implements OnInit {

  dataList = [];
  search: string = '';
  start: number = 0;
  length: number = 20;
  selectedLang: string;
  constructor(config: NgbDropdownConfig, private router: Router, private spinner: SpinnerService, private configModal: NgbModalConfig,
    private productService: ProductService, private modalService: NgbModal, private toastService: ToastService, public translate: TranslateService) {
    config.placement = 'bottom-center';
    config.autoClose = true;
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.getData();
    this.selectedLang = localStorage.getItem('language');
  }

  getData() {
    this.spinner.start();
    let query = {
      search: this.search,
      start: this.start,
      length: this.length
    };
    this.productService.getCatalogueCategories(query).subscribe(result => {
      let arr = this.dataList.concat(result.data);
      let newSet = new Set(arr);
      this.dataList = result.data;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }

  searchData() {
    if (this.search != null || this.search != '') {
      this.dataList = [];
      this.start = 0;
      this.getData();
    }
  }

  editCategory(item) {
    const modalRef = this.modalService.open(CategoryFormComponent, { centered: true });
    modalRef.componentInstance.data = item;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.getData();
    })
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.length += this.length;
      this.getData();
    }
  }
  /**
  * open modal to confirm hide
  */
  openConfirmHide(item) {
    let text = item.status == 'active' ? this.translate.instant('confirmMessages.hide') : this.translate.instant('confirmMessages.un-hide');
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = text + ' ' + this.translate.instant('confirmMessages.category');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + ` ${text} `+ this.translate.instant('confirmMessages.thisCategory')+' ?';
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
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
    this.productService.changeCategoryStatus(item).subscribe(result => {
      this.toastService.success(result.message);
      this.getData();
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
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle') +` `+this.translate.instant('confirmMessages.category');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.thisCategory')+` ?`;
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
    this.productService.deleteCategory(item).subscribe(result => {
      this.toastService.success(result.message);
      this.getData();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }

  navigateToSubCategory(item) {
    this.router.navigateByUrl(`/product/${item.id}/${item.name}/${item.nameTranslation.ar}/sub-category/list`);
  }
}
