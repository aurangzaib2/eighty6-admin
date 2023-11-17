import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from '../../../core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages, OPTIONS, productTypeForm } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { validateField } from '../../../shared/validators/form.validator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.scss'],
  providers: [NgbModalConfig, NgbModal, NgbActiveModal]
})
export class ProductTypeComponent implements OnInit {

  productTypeFrom = new FormGroup({
    types: new FormArray([])
  });
  types = this.productTypeFrom.get('types') as FormArray;
  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = productTypeForm;
  selectedIndex: number = null;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  selectedLang: string;
  token: any;
  constructor(public activeModal: NgbActiveModal, private productService: ProductService, private fb: FormBuilder,
    private spinner: SpinnerService, private toastService: ToastService, private modalService: NgbModal,
    private uploadService: UploadService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.getData();
    this.selectedLang = localStorage.getItem('language');

  }

  /**
 * add new type
 */
  addType() {
    this.types.push(this.fb.group({
      name: new FormControl('', [Validators.required]),
      Aname: new FormControl('', [Validators.required]),
      id: new FormControl(null),
      image: new FormControl(null),
    }))
    this.selectedIndex = this.types.length;
  }
  /**
   * remove at index
   * @param index 
   */
  removeType(index: number) {
    this.types.removeAt(index);
    this.selectedIndex = null;
  }
  toggleField(index, value) {
    if (this.types.controls[index].enabled) {
      this.types.controls[index].disable();
    }
    else {
      this.selectedIndex = index;
      this.types.controls[index].enable();
    }
  }
  /**
   * get all product type
   */
  getData() {
    this.spinner.start();
    this.productService.getProductType().subscribe(result => {
      this.types.clear();
      result.forEach(element => {
        this.types.push(this.fb.group({
          id: new FormControl(element.id),
          name: new FormControl(element.name),
          Aname: new FormControl(element.nameTranslation.ar),
          image: new FormControl(element.image),
        }))
      });
      this.types.disable()
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  uploadImage(event, index) {
    let file = event;
    if (this.uploadService.checkImageType(file)) {
      this.displayMessage = OPTIONS.imageType;
      return;
    }
    if (this.uploadService.checkFileSize(file)) {
      this.displayMessage = OPTIONS.sizeLimit;
      return;
    }
    this.spinner.start();
    let formData = new FormData();
    formData.append('file', file);
    this.uploadService.fileCheck(formData).subscribe(result => {
      this.loading = false;
      this.token = result.token;
      if (result.status == true) {
    this.uploadService.uploadFile(formData,this.token).subscribe(result => {
      let obj = result.result;
      this.fileInfo = obj.data;
      this.fileInfo.image = obj.cdn;
      this.fileInfo.originalSize = (this.fileInfo.size / 1024).toFixed(0)
      this.fileUploaded = true;
      this.toggleField(index, null);
      this.spinner.stop();
    }, error => {
      ;
      this.toastService.error(error);
      this.spinner.stop();
    })
  }
}, error => {
  this.loading = false;
  this.displayMessage = error;
});

}
  /**
  * add new product type
  * @returns 
  */
  onSubmit() {
    this.spinner.start();
    // if (this.productTypeFrom.invalid) {
    //   validateField(this.types);
    //   this.loading = false;
    //   return;
    // }
    let index = 0;
    if (this.types.value[this.selectedIndex - 1] && this.types.value[this.selectedIndex - 1].id == null) {
      index = this.selectedIndex - 1;
    }
if (!this.types.value[index].name || !this.types.value[index].Aname) {
  this.toastService.success('Please fill English & Arbic fields');
  this.spinner.stop();
  return;
}
    let obj = {
      id: null,
       name: this.types.value[index].name,
      nameTranslation: {en:this.types.value[index].name, ar:this.types.value[index].Aname},
      image: this.fileInfo.key,
    }
    if (this.types.value[index].id === null) {
      this.productService.addProductType(obj).subscribe(result => {
        this.spinner.stop();
        this.toastService.success(result);
        this.getData();
        this.selectedIndex = null;
      }, error => {
        this.spinner.stop();
        this.displayMessage = error;
      })
    }
    else {
      obj.id = this.types.value[index].id;

      this.update(obj);
    }
  }
  /**
   * update the product type
   * @returns 
   */
  update(obj) {
    this.productService.updateProductType(obj).subscribe(result => {
      this.spinner.stop();
      this.toastService.success(result);
      this.getData();
      this.selectedIndex = null;
    }, error => {
      this.spinner.stop();
      this.displayMessage = error;
    })
  }

  /**
  * open modal to confirm delete
  */
  openConfirmDelete(item,index) {
    if (item.id === null) {
      this.removeType(index);
      return;
    }
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle') +` `+this.translate.instant('confirmMessages.productType');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.productType')+ ` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.deleteRequest(item);
    })
  }
  /**
  * delete product type
  * @param item 
  */
  deleteRequest(item) {
    this.spinner.start();
    this.productService.deleteProductType(item).subscribe(result => {
      this.toastService.success(result.message);
      this.getData();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }

  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
  }
}
