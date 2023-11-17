import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService, UserService } from '../../../core';
import { MetadataService } from '../../../core/services/metadata.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { deliveryStatus } from '../../../helpers';

@Component({
  selector: 'app-onboarding-reject',
  templateUrl: './onboarding-reject.component.html',
  styleUrls: ['./onboarding-reject.component.scss']
})
export class OnboardingRejectComponent implements OnInit {

  @Input() userData: any = {};
  rejectForm = new FormGroup({
    reason: new FormControl('', [Validators.required]),
    status: new FormControl(deliveryStatus.REJECTED),
    id: new FormControl(),
    role: new FormControl(),
  })
  loading: boolean = false;
  displayMessage: string = null;

  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private location: Location,
    private spinner: SpinnerService, private toastService: ToastService, private onboardingService: OnboardingService , public translate: TranslateService) { }

  ngOnInit(): void {
    this.form.role.setValue(this.userData.role);
    if (this.form.role.value.match('SUPPLIER')) {
      this.form.id.setValue(this.userData.id);
    }
    else if (this.form.role.value.match('RESTAURANT_ADMIN')) {
      this.form.id.setValue(this.userData.id);
    }
    else {
      this.form.id.setValue(this.userData.id);
    }

  }
  get form() {
    return this.rejectForm.controls;
  }
  /**
   * reject the user
   * @returns 
   */
  onSubmit() {
    this.loading = true;
    if (this.rejectForm.invalid) {
      this.loading = false;
      return;
    }
    if (this.form.role.value.match('SUPPLIER')) {
      this.approvedRejectSupplier();
    }
    else if (this.form.role.value.match('RESTAURANT_ADMIN')) {
      this.approvedRejectRestaurant();
    }
    else {
      this.approvedRejectCompany();
    }
  }
  /**
   * approve/reject supplier
   */
  approvedRejectSupplier() {
    this.onboardingService.approveRejectSupplier(this.rejectForm.value).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.dismissModal();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * approve/reject restaurant
   */
  approvedRejectRestaurant() {
    this.onboardingService.approveRejectRestaurant(this.rejectForm.value).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.dismissModal();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
* approve/reject company
*/
  approvedRejectCompany() {
    this.onboardingService.approveRejectCompany(this.rejectForm.value).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.dismissModal();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * dismiss modal
   */
  dismissModal() {
    this.modalService.dismissAll('dismiss modal');
  }
  /**
   * close modal
   */
  closeModal() {
    this.activeModal.close('close modal');
  }
}
