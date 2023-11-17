import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UploadService, User, UserService } from '../../../core';
import { NgbActiveModal, NgbDropdownConfig, NgbModal, NgbModalConfig, NgbNavConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../core/services/toast.service';
import csc from 'country-state-city';
import { SpinnerService } from '../../../core/services/spinner.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { validateField } from '../../../shared/validators/form.validator';
import { confirmMessages, coordinates, onBoardingRoles, OPTIONS, profileFromErrors } from '../../../helpers';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { Location } from '@angular/common';
import { AlertModalComponent } from '../../../shared';
import { OnboardingRejectComponent } from '../../onboarding/onboarding-reject/onboarding-reject.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  activeTab = 1;
  @Input() userData: any = {};
  profileForm = new FormGroup({
    id: new FormControl(null),
    role: new FormControl('', [Validators.required]),
    logo: new FormControl(),
    banner: new FormControl(),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    name: new FormControl(''),
    Aname: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(15), Validators.minLength(8)]),
    officePhoneNumber: new FormControl('', [Validators.maxLength(15), Validators.minLength(8)]),
    officePhoneCountryCode: new FormControl(),
    locationPoint: new FormControl([1, 2]),
    unitNo: new FormControl(''),
    floorNo: new FormControl(''),
    street: new FormControl(''),
    area: new FormControl(''),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    // deliveryLocation: new FormArray([]),
    media: new FormArray([], [Validators.required, Validators.minLength(1)]),
    status: new FormControl()
  });
  user: any = {};
  displayMessage: string = null;
  errorMessages = profileFromErrors;
  deliveryLocation;
  contactPerson;
  media = this.profileForm.get('media') as FormArray;
  mediaTypes = [{ name: "national_id_card", displayName: 'National Id Card' },
  { name: "trade_license", displayName: 'Trade License' }, { name: "trn_certificate", displayName: 'TRN Certificate' }];
  countryList = [];
  phoneCodeList = [];
  cityList = [];
  itemsAsObjects = [];

  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  markers = [
    // These are all just random coordinates from https://www.random.org/geographic-coordinates/
    // { lat: 48.75606, lng: -118.859, alpha: 1 },
  ];
  constructor(private fb: FormBuilder, private metaDataService: MetadataService,
    private toastService: ToastService, private spinner: SpinnerService,
    private onboardingService: OnboardingService, private userService: UserService,
    private modalService: NgbModal, private configModal: NgbModalConfig, private activeModal: NgbActiveModal, public translate: TranslateService) {

    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
    this.mediaTypes.forEach((element) => {
      this.media.push(this.fb.group({
        id: new FormControl(),
        path: new FormControl(),
        name: new FormControl(),
        fileType: new FormControl(element.name),
        displayName: new FormControl(element.displayName),
      }))
    })
  }

  ngOnInit() {
    if (this.userData.id != null) {
      this.getCountries();
    }
  }
  get form() {
    return this.profileForm.controls;
  }
  /**
 * return the banner url
 * @returns 
 */
  getUrl() {
    return this.userData?.banner != null ? `url(${this.userData?.banner})` : 'assets/images/banner.png';
  }
  /**
   * check the role name
   * @returns label name
   */
  checkRoleName(): string {
    if (this.form.role.value.match('RESTAURANT_SUPER_ADMIN')) {
      return 'company';
    }
    else if (this.form.role.value.match('RESTAURANT_ADMIN')) {
      return 'restaurant';
    }
    else {
      return 'supplier';
    }
  }
  getParams() {
    if (this.userData['id'] && this.userData['role'] === 'SUPPLIER') {
      this.form.role.setValue('SUPPLIER');
      this.getProfileSupplier(this.userData['supplier'].id);
    }
    else if (this.userData['id'] && this.userData['role'] === 'RESTAURANT_ADMIN') {
      this.form.role.setValue('RESTAURANT_ADMIN');
      this.profileForm.addControl('deliveryInstruction', new FormControl(''))
      this.getProfileRestaurant(this.userData['restaurant'].id);
    }
    else if (this.userData['id'] && this.userData['role'] === 'RESTAURANT_SUPER_ADMIN') {
      this.form.role.setValue('RESTAURANT_SUPER_ADMIN');
      this.getProfileCompany(this.userData['company'].id);
    }
    else {
      this.spinner.stop();
    }
    this.setValidators();
  }
  /**
 * set validators
 */
  setValidators() {
    if (this.form.role.value.match('RESTAURANT_SUPER_ADMIN')) {
      this.form.firstName.setValidators([Validators.required]);
      this.form.lastName.setValidators([Validators.required]);

      // this.profileForm.removeControl('companyId');
      // this.profileForm.removeControl('deliveryInstruction');
      this.profileForm.removeControl('contactPerson');
      this.profileForm.removeControl('minOrder');
      this.profileForm.removeControl('commission');
      this.profileForm.removeControl('contactPerson');
    }
    else if (this.form.role.value.match('RESTAURANT_ADMIN')) {
      this.form.firstName.setValidators([Validators.required]);
      this.form.lastName.setValidators([Validators.required]);
      // this.profileForm.addControl('companyId', new FormControl(''))
      // this.profileForm.addControl('deliveryInstruction', new FormControl());

      this.profileForm.removeControl('contactPerson');
      this.profileForm.removeControl('minOrder');
      this.profileForm.removeControl('commission');
      this.profileForm.removeControl('contactPerson')
    }
    else {
      this.form.firstName.clearValidators();
      this.form.lastName.clearValidators();
      // this.profileForm.removeControl('companyId');
      // this.profileForm.removeControl('deliveryInstruction');
      this.profileForm.addControl('contactPerson', new FormArray([]))
      this.profileForm.addControl('minOrder', new FormControl())
      this.profileForm.addControl('commission', new FormControl('', [Validators.required]))
    }
    this.form.firstName.updateValueAndValidity();
    this.form.lastName.updateValueAndValidity();
  }
  /**
   * get supplier profile
   */
  getProfileSupplier(id) {
    this.onboardingService.getProfileSupplier(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      userData.deliveryLocation.forEach(element => {
        this.itemsAsObjects.push(element);
        this.onAddTag(element);
      });
      this.user = userData;
      this.profileForm.controls.name.setValue(userData.nameTranslation?.en);
      this.profileForm.controls.Aname.setValue(userData.nameTranslation?.ar);
      this.user.role = this.form.role.value;
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      userData.media.forEach((element) => {
        let index = this.mediaTypes.findIndex(x => x.name === element.fileType);
        if (index > -1) {
          this.media.controls[index].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[index].name,
            displayName: this.mediaTypes[index].displayName,
          });
        }
      })
      this.setCountry(userData.countryName);
      this.profileForm.disable();

      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  /**
  * get restaurant profile
  */
  getProfileRestaurant(id) {
    this.onboardingService.getProfileRestaurant(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      this.user = userData;
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      this.user.role = this.form.role.value;
      userData.media.forEach((element) => {
        let index = this.mediaTypes.findIndex(x => x.name === element.fileType);
        if (index > -1) {
          this.media.controls[index].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[index].name,
            displayName: this.mediaTypes[index].displayName,
          });
        }
      })
      this.spinner.stop();
      this.setCountry(userData.countryName);
      this.profileForm.disable();

     
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  /**
  * get restaurant profile
  */
  getProfileCompany(id) {
    this.onboardingService.getProfileCompany(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      this.user = userData;
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      this.user.role = this.form.role.value;
      userData.media.forEach((element) => {
        let index = this.mediaTypes.findIndex(x => x.name === element.fileType);
        if (index > -1) {
          this.media.controls[index].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[index].name,
            displayName: this.mediaTypes[index].displayName,
          });
        }
      })
      this.setCountry(userData.countryName);
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  /**
   * get all the countries
   */
  getCountries() {
    this.spinner.start();
    this.metaDataService.getCountries().subscribe(data => {
      this.countryList = data;
      this.phoneCodeList = this.countryList;
      this.getParams();
    })
  }
  /**
   * set country
   * @param name 
   */
  setCountry(name) {
    this.spinner.stop();
    if (name) {
      let country = this.countryList.find(c => c.name === (name));
      if (country.code2l) {
        this.form.countryCode.setValue(country.code2l);
        this.cityList = csc.getCitiesOfCountry(country.code2l);
      }
    }
    this.profileForm.disable();
  }

  /**
  * add delivery locations
  */
  onAddTag($event) {
    // this.deliveryLocation.push(this.fb.group({
    //   name: new FormControl($event.name, [Validators.required]),
    // }))
  }
  /**
  * download file
  * @param data 
  */
  downloadFile(data) {
    saveAs(data.path, data.originalname, { autoBom: true });
  }

  addMarker(lat: number, lng: number) {
    this.latitude = lat;
    this.longitude = lng;
    this.markers.push({ lat, lng, alpha: 1 });
  }
  /**
   * change status(approve/reject)
   */
  onSubmitStatus() {
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
  openConfirm() {
    this.profileForm.enable();
    // if (this.profileForm.invalid) {
    //   validateField(this.profileForm);
    //   return;
    // }
    let index = 0;
    for (let i = 0; i < this.media.controls.length; i++) {
      if (this.media.controls[i].value.name) {
        index++;
      }
    }
    if (index != this.media.controls.length) {
      this.displayMessage = 'Please upload all the documents';
      return;
    }
    this.closeModal();
    let text = 'approve';
    this.user.status = 'approved';
    this.form.status.setValue(this.user.status);
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    // modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + `${text} this ${this.checkRoleName()} ?`;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription')+" "+this.translate.instant('confirmMessages.Restaurants/SupplierName')
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    // modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {
      this.spinner.start();
      this.onSubmitStatus();
    })
  }
  /**
  * open reject
  */
  openReject() {
    this.closeModal();
    const modalRef = this.modalService.open(OnboardingRejectComponent, { centered: true });
    modalRef.componentInstance.userData = this.profileForm.value;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.userService.refreshTable.next(true);
    })
  }
  /**
   * approve/reject supplier
   */
  approvedRejectSupplier() {
    this.onboardingService.approveRejectSupplier(this.profileForm.value).pipe(first()).subscribe(
      data => {
        this.spinner.stop();
        this.toastService.success(data.message);
        this.userService.refreshTable.next(true);
        this.dismissModal();
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }
  /**
   * approve/reject restaurant
   */
  approvedRejectRestaurant() {
    this.onboardingService.approveRejectRestaurant(this.profileForm.value).pipe(first()).subscribe(
      data => {
        this.spinner.stop();
        this.toastService.success(data.message);
        this.dismissModal();
        this.userService.refreshTable.next(true);
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }
  /**
  * approve/reject company
  */
  approvedRejectCompany() {
    this.onboardingService.approveRejectCompany(this.profileForm.value).pipe(first()).subscribe(
      data => {
        this.spinner.stop();
        this.toastService.success(data.message);
        this.dismissModal();
        this.userService.refreshTable.next(true);
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
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
