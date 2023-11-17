import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UploadService, User, UserService } from '../../../core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../core/services/toast.service';
import csc from 'country-state-city';
import { SpinnerService } from '../../../core/services/spinner.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { validateField } from '../../../shared/validators/form.validator';
import { coordinates, languages, OPTIONS, profileFromErrors } from '../../../helpers';
import { saveAs } from 'file-saver';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  providers: [NgbDropdownConfig]
})
export class ProfileFormComponent implements OnInit, OnDestroy {

  profileForm = new FormGroup({
    profilePicture: new FormControl(),
    profilePictureCDN: new FormControl(),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    language: new FormControl(''),
    currentPassword: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    adminSecondaryContact: new FormArray([]),

  });
  adminSecondaryContact = this.profileForm.get('adminSecondaryContact') as FormArray;
  loading = false;
  user: User = null;
  countryList = [];
  phoneCodeList = [];
  cityList = [];

  latitude = coordinates.latitude;
  longitude = coordinates.longitude;

  languageList = languages;
  errorMessages = profileFromErrors;
  displayMessage: string = null;

  isEditable: boolean = false;
  passwordType: string = 'text';
  token: any;
  constructor(private fb: FormBuilder, private userService: UserService, private metaDataService: MetadataService,
    private toastService: ToastService, config: NgbDropdownConfig, private spinner: SpinnerService, private uploadService: UploadService, public translate: TranslateService) {
    // customize default values of drop downs used by this component tree
    config.placement = 'bottom';
    config.autoClose = false;

  }

  get form() {
    return this.profileForm.controls;
  }
  enableFrom() {
    this.isEditable = !this.isEditable;
    if (this.profileForm.enabled) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
    }
    this.form.profilePicture.setValue(null);
  }
  ngOnInit() {
    this.getCountries();
  }
  ngOnDestroy() {
    this.spinner.stop();
  }
  customizeRoleText(text): string {
    return text.replace('_', ' ').toLowerCase();
  }
  /**
   * get user profile
   */
  getProfile() {
    this.userService.getProfile().subscribe((userData) => {
      this.user = userData;
      this.patchForm(userData)
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  patchForm(userData) {
    this.profileForm.patchValue(userData);
    this.form.profilePictureCDN.setValue(this.user);
    userData.adminSecondaryContact.forEach(element => {
      this.adminSecondaryContact.push(this.fb.group({
        fullName: new FormControl(element.fullName),
        email: new FormControl(element.email),
        mobileCode: new FormControl(element.mobileCode),
        officePhoneCountryCode: new FormControl(element.officePhoneCountryCode),
        mobileNumber: new FormControl(element.mobileNumber),
        title: new FormControl(element.title),
      }))
      this.adminSecondaryContact.disable();
    });
    if (userData.countryName) {
      this.setCountry(userData.countryName);
    }
    this.profileForm.disable();
    this.spinner.stop();
  }
  addContactPerson() {
    if (!this.isEditable) {
      return;
    }
    this.adminSecondaryContact.push(this.fb.group({
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      mobileCode: new FormControl('', [Validators.required]),
      mobileNumber: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
    }))
  }
  /**
   * remove at index
   * @param index 
   */
  removeContactPerson(index: number) {
    if (!this.isEditable) {
      return;
    }
    this.adminSecondaryContact.removeAt(index)
  }
  /**
   * get all the countries
   */
  getCountries() {
    this.spinner.start();
    this.metaDataService.getCountries().subscribe(data => {
      this.countryList = data;
      this.phoneCodeList = this.countryList;
      this.getProfile();
    })
  }
  /**
   * set country
   * @param name 
   */
  setCountry(name) {
    let country = this.countryList.find(c => c.name.toLowerCase() === (name.toLowerCase()));
    this.form.countryCode.setValue(country.code2l);
    this.cityList = csc.getCitiesOfCountry(country.code2l);
  }

  /**
   * return the banner url
   * @returns 
   */
  getUrl() {
    return 'url(assets/images/profile-banner.svg)';
  }

  /**
   * check upload file type
   * @param file 
   * @returns 
   */
  checkImageType(file) {
    if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
      return true;
    }
    return false
  }
  /**
   * upload images
   * @param event 
   * @param type 
   */
  uploadImage(event) {
    let file = event;
    this.displayMessage = null;
    if (this.uploadService.checkImageType(file)) {
      this.displayMessage = OPTIONS.imageType;
      return;
    }
    if (this.uploadService.checkFileSize(file)) {
      this.displayMessage = OPTIONS.sizeLimit;
      return;
    }
    this.spinner.start();
    this.spinner.start();
    let formData = new FormData();
    formData.append('file', file);
    this.uploadService.fileCheck(formData).subscribe(result => {
      this.loading = false;
      this.token = result.token;
      if (result.status == true) {
    this.uploadService.uploadFile(formData,this.token).subscribe(result => {

      let obj = result.result;
      this.form.profilePicture.setValue(obj.data.key);
      this.form.profilePictureCDN.setValue(obj.cdn);

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
   * submit and update user profile
   * @returns 
   */
  onSubmit() {
    this.displayMessage = null;
    if (this.form.currentPassword.value) {
      this.form.currentPassword.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.password.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.confirmPassword.setValidators([Validators.required, Validators.minLength(6)]);
    }
    else {
      this.form.currentPassword.clearValidators();
      this.form.password.clearValidators();
      this.form.confirmPassword.clearValidators();
    }
    this.form.currentPassword.updateValueAndValidity();
    this.form.password.updateValueAndValidity();
    this.form.confirmPassword.updateValueAndValidity();

    if (this.profileForm.invalid) {
      validateField(this.profileForm);
      return;
    }
    if (this.form.password.value && this.form.confirmPassword.value != this.form.password.value) {
      this.displayMessage = 'Password & confirm password didn\'t match';
      return;
    }
    this.loading = true;
    this.userService.updateProfile(this.profileForm.value).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.toastService.success('Profile updated successfully');
        this.profileForm.disable();
        this.isEditable = false;
        this.resetValidation();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
        // this.toastService.error(error);
      });
  }
  resetValidation() {
    this.form.currentPassword.reset();
    this.form.password.reset();
    this.form.confirmPassword.reset();
    this.form.currentPassword.clearValidators();
    this.form.password.clearValidators();
    this.form.confirmPassword.clearValidators();
    this.form.currentPassword.updateValueAndValidity();
    this.form.password.updateValueAndValidity();
    this.form.confirmPassword.updateValueAndValidity();
  }
}
