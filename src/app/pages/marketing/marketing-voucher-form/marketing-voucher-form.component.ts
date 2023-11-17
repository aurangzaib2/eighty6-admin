import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder, NgModel } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { UploadService } from '../../../core';
import { MarketingService } from '../../../core/services/marketing.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { marketingErrors } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-marketing-voucher-form',
  templateUrl: './marketing-voucher-form.component.html',
  styleUrls: ['./marketing-voucher-form.component.scss']
})
export class MarketingVoucherFormComponent implements OnInit {

  @Input() voucherData: any = { id: null };
  @Input() type: string = null;
  voucherForm = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required, Validators.maxLength(15)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    discountInPercentage: new FormControl('', [Validators.required]),
    maximumDiscount: new FormControl('', [Validators.required]),
    restaurants: new FormControl([], [Validators.required, Validators.minLength(1)])
  });

  selectedRestaurants = [];

  loading: boolean = false;
  submitted: boolean = false;
  displayMessage: string = null;
  errorMessages = marketingErrors;
  minDate = null;
  restaurantList = [];
  all = { id: 'all', name: 'Select All', selected: false };
  dropdownSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    allowSearchFilter: true,
    badgeShowLimit: 6,
    labelKey: 'name',
    disabled: true
  };
  constructor(public modalService: NgbModal, private marketingService: MarketingService, private activeModal: NgbActiveModal,
    private toastService: ToastService, private spinner: SpinnerService, private uploadService: UploadService, private calendar: NgbCalendar,
    private metaDataService: MetadataService, private fb: FormBuilder, private changeDetaction: ChangeDetectorRef) {
    this.minDate = calendar.getToday();
  }


  ngOnInit(): void {
    this.getAllRestaurant();
  }
  enableForm() {
    this.type = 'edit';
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      allowSearchFilter: true,
      badgeShowLimit: 6,
      labelKey: 'name',
      disabled: false
    };
    this.changeDetaction.detectChanges();
    this.voucherForm.enable();
  }
  get form() {
    return this.voucherForm.controls;
  }
  setDisplayDate(value: string) {
    let newDate = new Date(value);
    if (value) {
      return {
        day: newDate.getDate(),
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear()
      };
    }
    return null;
  }
  /**
  * set in format
  * @param date 
  * @returns 
  */
  setDate(date) {
    if (!date.year) {
      return date;
    }
    return moment(`${date.year}-${date.month}-${date.day}`).format('YYYY-MM-DD HH:mm:ss');
  }

  getAllRestaurant() {
    this.spinner.start();
    this.metaDataService.getRestaurants().subscribe(data => {
      let restaurants = data.map(element => ({
        id: element.id,
        name: element.name,
      }))
      this.restaurantList = restaurants;
      if (this.voucherData.id != null) {
        this.voucherForm.patchValue(this.voucherData);
        this.form.startDate.setValue(this.setDisplayDate(this.voucherData.startDate));
        this.form.endDate.setValue(this.setDisplayDate(this.voucherData.endDate));
        if (this.type === 'view') {
          this.voucherForm.disable();
        }
      } else {
        this.dropdownSettings = {
          singleSelection: false,
          selectAllText: 'Select All',
          allowSearchFilter: true,
          badgeShowLimit: 6,
          labelKey: 'name',
          disabled: false
        };
      }
      this.spinner.stop();
    })
  }
  /**
  * add a new voucher
  * @returns 
  */
  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.displayMessage = null;
    console.log(this.voucherForm.controls)
    if (!this.voucherForm.valid) {
      validateField(this.voucherForm);
      this.loading = false;
      return;
    }
    this.dropdownSettings.disabled = false;
    let payload = {
      name: this.form.name.value,
      code: this.form.code.value,
      startDate: this.setDate(this.form.startDate.value),
      endDate: this.setDate(this.form.endDate.value),
      discountInPercentage: this.form.discountInPercentage.value,
      maximumDiscount: this.form.maximumDiscount.value,
      restaurants: this.form.restaurants.value
    }
    this.marketingService.createVoucher(payload).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      ;
      this.displayMessage = error;
    })
  }
  /**
   * update thr voucher
   * @returns 
   */
  update() {
    this.loading = true;
    this.displayMessage = null;
    this.submitted = true;
    this.dropdownSettings.disabled = false;
    if (this.form.startDate.value) {
      this.form.startDate.clearValidators();
      this.form.startDate.updateValueAndValidity();
    }
    if (this.form.endDate.value) {
      this.form.endDate.clearValidators();
      this.form.endDate.updateValueAndValidity();
    }
    if (!this.voucherForm.valid) {
      validateField(this.voucherForm);
      this.loading = false;
      return;
    }
    let payload = {
      id: this.form.id.value,
      name: this.form.name.value,
      code: this.form.code.value,
      startDate: this.setDate(this.form.startDate.value),
      endDate: this.setDate(this.form.endDate.value),
      discountInPercentage: this.form.discountInPercentage.value,
      maximumDiscount: this.form.maximumDiscount.value,
      restaurants: this.form.restaurants.value
    }
    console.log(payload)
    this.marketingService.updateVoucher(payload).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
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
    this.activeModal.close('close modal')
  }
}
