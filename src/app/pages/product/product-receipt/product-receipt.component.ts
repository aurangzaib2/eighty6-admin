import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { defaultStatus, productFormErrors } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-product-receipt',
  templateUrl: './product-receipt.component.html',
  styleUrls: ['./product-receipt.component.scss']
})
export class ProductReceiptComponent implements OnInit {

  @Input() data: any = { id: null };
  rejectForm = new FormGroup({
    reason: new FormControl(''),
    status: new FormControl(''),
    id: new FormControl()
  })
  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = productFormErrors;

  showRejectForm: boolean = false;
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private productService: ProductService,
    private toastService: ToastService, private spinner: SpinnerService , public translate: TranslateService) { }

  get form() {
    return this.rejectForm.controls;
  }

  ngOnInit(): void {
    if (this.data.id) {
      this.rejectForm.patchValue(this.data);
    }
  }

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
  openReject() {
    this.form.status.setValue(defaultStatus.REJECTED);
    this.form.reason.setValidators([Validators.required]);
    this.form.reason.updateValueAndValidity();
    this.showRejectForm = true;
  }
  approved() {
    this.form.status.setValue(defaultStatus.ACTIVE);
    this.onSubmit();
  }
  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
  }
}
