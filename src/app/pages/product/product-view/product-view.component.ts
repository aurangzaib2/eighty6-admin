import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  categoryData = { id: null, name: null ,subCategoryId:null};
  subHeaderData: any = {};
  productData: any = {};
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(configModal: NgbModalConfig, private modalService: NgbModal, private router: Router, private spinner: SpinnerService,
    private route: ActivatedRoute, private location: Location, private productService: ProductService,
    private toastService: ToastService ,  public translate: TranslateService) { }

  ngOnInit(): void {
    this.getParams();
   this.selectedLang = localStorage.getItem('language');    

  }
  getParams() {
    this.route.queryParams.subscribe(params1 => {
      this.route.paramMap.subscribe(params2 => {
        this.subHeaderData.supplierName = params2.get('name3');
        this.getProductDetails(params1['id'], params1['sid']);
      });
    })
  }
  getProductDetails(id, sid) {
    this.spinner.start();
    this.productService.getProductDetails(id, sid).subscribe(result => {
      this.productData = result;
      this.spinner.stop();
    }, error => {
      // ;
      this.spinner.stop();
    })
  }
  /**
 * open modal of product
 */
  open() {
    const modalRef = this.modalService.open(ProductFormComponent, { centered: true });
    modalRef.componentInstance.catId = this.productData.categoryId;
    modalRef.componentInstance.subCatId = this.productData.subCategoryId;
    modalRef.result.then((result) => {
   
    }, (dismiss) => {
      this.goBackThrice();
    })
  }
  /**
   *  modal for edit product
   */
  edit() {
    // item.categoryName = this.categoryData.name;
    const modalRef = this.modalService.open(ProductFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.productData = this.productData.product;
    modalRef.componentInstance.productData.categoryId = this.productData.categoryId;
    modalRef.componentInstance.productData.subCategoryId = this.productData.subCategoryId;
    modalRef.componentInstance.productData.categoryName = this.productData.category.name;
    modalRef.componentInstance.type = 'edit';
    modalRef.result.then((result) => {
      // 
    }, (dismiss) => {
      // 
      this.getParams();
    })
  }
  /**
  * open modal to confirm out of stock
  */
  openConfirmStock() {
    let text = this.productData.inStock ? 'out of stock' : 'in stock';
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = confirmMessages.stockTitle;
    modalRef.componentInstance.description = confirmMessages.stockDescription + ` as ${text} ?`;
    modalRef.componentInstance.okText = 'Yes';
    modalRef.componentInstance.cancelText = 'No';
    modalRef.result.then((result) => {
      // 
    }, (dismiss) => {
      // 
      this.stockRequest();
    })
  }
  /**
  * out of stock request
  * @param item 
  */
  stockRequest() {
    this.spinner.start();
    let obj = {
      inventoryId: this.productData.id,
      inStock: this.productData.inStock ? false : true
    }
    this.productService.updateProductStock(obj).subscribe(result => {
      this.toastService.success(result);
      this.getParams();
    }, error => {
      // ;
      this.spinner.stop();
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
  goBackFourth() {
    window.history.go(-4);
  }
}
