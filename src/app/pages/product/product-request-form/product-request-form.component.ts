import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { defaultStatus, OPTIONS, productFormErrors } from '../../../helpers';
import { ProductService } from '../../../core/services/product.service';
import { validateField } from '../../../shared/validators/form.validator';
import { MetadataService } from '../../../core/services/metadata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-request-form',
  templateUrl: './product-request-form.component.html',
  styleUrls: ['./product-request-form.component.scss'],
})
export class ProductRequestFormComponent implements OnInit {

  @Input() id: null;
  @Input() isEditable: boolean = false;
  requestProductForm = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    categoryId: new FormControl(''),
    type: new FormControl('product'),
    image: new FormControl(''),
    subCategoryId: new FormControl('', [Validators.required]),
    displayName: new FormControl('', [Validators.required]),
    packagingId: new FormControl('', [Validators.required]),
    unitId: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required]),
    brandName: new FormControl('', [Validators.required]),
    origin: new FormControl('', [Validators.required]),
    productType: new FormControl([], [Validators.required]),
    supplierId: new FormControl('', [Validators.required]),
  });
  rejectForm = new FormGroup({
    reason: new FormControl(''),
    status: new FormControl(''),
    id: new FormControl()
  })
  categoryList = [];
  subCategoryList = [];
  unitsList: [];
  countryList = [];
  typeList = [];
  packagingList = [];

  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = productFormErrors;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  submitted: boolean = false;
  requestData: any = {};

  showRejectForm: boolean = false;
  token: any;
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private productService: ProductService,
    private uploadService: UploadService, private toastService: ToastService, private spinner: SpinnerService,
    private metadataService: MetadataService, public translate: TranslateService) { }

  get form() {
    return this.requestProductForm.controls;
  }
  get form2() {
    return this.rejectForm.controls;
  }
  ngOnInit(): void {
    if (this.id) {
      this.rejectForm.controls.id.setValue(this.id);
      this.getData();
      // this.requestProductForm.patchValue(this.data);
      // this.fileInfo.image = this.data.image
      // this.fileUploaded = true;
      if (!this.isEditable) {
        this.requestProductForm.disable();
      }
    }
    this.getAllCategory();
  }
  enableForm() {
    this.isEditable = true;
    this.requestProductForm.enable();
  }
  getData() {
    this.spinner.start();
    this.productService.viewRequestProduct(this.id).subscribe(data => {
      this.requestData = data;
      this.requestProductForm.patchValue(data);
      this.requestProductForm.controls.productType.setValue(this.requestData.requestSupplierType.map(x => x.id));
      this.requestProductForm.controls.supplierId.setValue(this.requestData.supplier.id);
      this.getSubCategory();
      this.fileInfo.image = this.requestData.image;
      this.fileUploaded = this.fileInfo.image ? true : false;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    });
  }
  getAllCategory() {
    this.spinner.start();
    this.productService.getGlobalCategories().subscribe(result => {
      this.categoryList = result;
      this.getMetadata();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getSubCategory() {
    this.spinner.start();
    this.productService.getGlobalSubCategories({ parentId: this.form.categoryId.value }).subscribe(result => {
      this.subCategoryList = result;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getMetadata() {
    this.metadataService.getMetaData().subscribe(result => {
      this.countryList = result.countries;
      this.typeList = result.productType;
      this.unitsList = result.units;
      this.packagingList = result.packaging;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }
  uploadImage(event) {
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
      this.form.image.setValue(obj.data.key);
      this.fileInfo = obj.data;
      this.fileInfo.image = obj.cdn;
      this.fileInfo.originalSize = (this.fileInfo.size / 1024).toFixed(0)
      this.fileUploaded = true;
      this.displayMessage = null;
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
  clearImage() {
    this.fileUploaded = false;
    this.form.image.setValue('');
  }

  /**
   * update the product request
   * @returns 
   */
  update() {
    this.loading = true;
    this.submitted = true;
    this.displayMessage = null;
    if (this.requestProductForm.invalid) {
      validateField(this.requestProductForm);
      this.loading = false;
      return;
    }
    this.productService.updateRequestedProduct(this.requestProductForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
  openReject() {
    this.form2.status.setValue(defaultStatus.REJECTED);
    this.form2.reason.setValidators([Validators.required]);
    this.form2.reason.updateValueAndValidity();
    this.showRejectForm = true;
  }
  approved() {
    this.form2.status.setValue(defaultStatus.ACTIVE);
    this.onSubmit();
  }
  // reject
  onSubmit() {
    this.spinner.start();
    if (this.rejectForm.invalid) {
      validateField(this.rejectForm);
      this.spinner.stop();
      return;
    }
    this.productService.updateProductRequestStatus(this.rejectForm.value).subscribe(result => {
      this.spinner.stop();
      this.toastService.success(result.message);
      this.dismissModal();
    }, error => {
      this.spinner.stop();
      this.displayMessage = error;
    })
  }

  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
  }

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
      this.uploadImage(files[0]);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }
}
