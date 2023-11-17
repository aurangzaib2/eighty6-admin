import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { productTypeForm, confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';

@Component({
  selector: 'app-product-packaging',
  templateUrl: './product-packaging.component.html',
  styleUrls: ['./product-packaging.component.scss'],
  providers: [NgbModalConfig, NgbModal, NgbActiveModal]
})
export class ProductPackagingComponent implements OnInit {

  packagingForm = new FormGroup({
    types: new FormArray([])
  });
  types = this.packagingForm.get('types') as FormArray;
  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = productTypeForm;
  selectedIndex: number = null;
  constructor(public activeModal: NgbActiveModal, private productService: ProductService, private fb: FormBuilder,
    private spinner: SpinnerService, private toastService: ToastService, private modalService: NgbModal ,public translate: TranslateService) { }

  ngOnInit(): void {
    this.getData();
  }

  /**
 * add new type
 */
  addType() {
    this.types.push(this.fb.group({
      name: new FormControl('', [Validators.required]),
      Aname: new FormControl('', [Validators.required]),
      id: new FormControl(null),
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
    this.productService.getPackaging().subscribe(result => {

      this.types.clear();
      result.forEach(element => {
        this.types.push(this.fb.group({
          id: new FormControl(element.id),
          name: new FormControl(element.name),
          Aname: new FormControl(element.nameTranslation.ar)
        }))
      });
      this.types.disable()
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }

  /**
  * add new product type
  * @returns 
  */
  onSubmit() {
    this.spinner.start();

    // if (this.packagingForm.invalid) {
    //   validateField(this.types);
    //   this.loading = false;
    //   return;
    // }
    let index = 0;
    if (!this.types.value[index].name || !this.types.value[index].Aname) {
      this.toastService.success('Please fill English & Arbic fields');
      this.spinner.stop();
      return;
    }
    let obj = {
      id: null,
       name: this.types.value[index].name,
      nameTranslation: {en:this.types.value[index].name, ar:this.types.value[index].Aname},
    }
    if (this.types.value[0].id === null) {
      this.productService.addPackaging(obj).subscribe(result => {
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
    this.productService.updatePackaging(obj).subscribe(result => {
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
  openConfirmDelete(item, index) {
    if (item.id === null) {
      this.removeType(index);
      return;
    }
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle')+` `+this.translate.instant('confirmMessages.package');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription')+` `+this.translate.instant('confirmMessages.package')+` ?`;
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
    this.productService.deletePackaging(item).subscribe(result => {
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
