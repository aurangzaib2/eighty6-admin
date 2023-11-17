import { Component, ElementRef, OnDestroy, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { RestaurantService, UploadService, User, UserService } from '../../../core';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
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
import { OnboardingRejectComponent } from '../onboarding-reject/onboarding-reject.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { TranslationService } from '../../../core';
import { element } from 'protractor';
import { AppRoutingModule } from '../../../app-routing.module';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-onboarding-details',
  templateUrl: './onboarding-details.component.html',
  styleUrls: ['./onboarding-details.component.scss']
})
export class OnboardingDetailsComponent implements OnInit, OnDestroy {

  @ViewChild("nav")
  nav;

  profileForm = new FormGroup({
    id: new FormControl(null),
    role: new FormControl('SUPPLIER', [Validators.required]),
    logo: new FormControl(),
    banner: new FormControl(),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    name: new FormControl(''),
    Aname: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('971', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(8)]),
    password: new FormControl(null, [Validators.minLength(6)]),
    confirmPassword: new FormControl(null),
    officePhoneNumber: new FormControl(null, [Validators.maxLength(10), Validators.minLength(8)]),
    officePhoneCountryCode: new FormControl('971'),
    locationPoint: new FormControl([1, 2]),
    unitNo: new FormControl(''),
    floorNo: new FormControl(''),
    street: new FormControl(''),
    area: new FormControl(''),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    deliveryLocation: new FormControl([]),
    reason: new FormControl(''),
    isStandalone: new FormControl(false),
    commission: new FormControl('', [Validators.required]),
    minOrder: new FormControl('', [Validators.required]),
    workStartTime: new FormControl(),
    workEndTime: new FormControl(),
    companyId: new FormControl(),
    contactPerson: new FormArray([]),
    isOnBoarded: new FormControl(false),
    media: new FormArray([], [Validators.required, Validators.minLength(3)]),
    trnNumber: new FormControl(''),
    billToEmail: new FormControl('', [Validators.pattern(OPTIONS.emailPattern)])
  });

  profileFormAr = new FormGroup({
    id: new FormControl(null),
    role: new FormControl('SUPPLIER', [Validators.required]),
    logo: new FormControl(),
    banner: new FormControl(),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    name: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('971', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(8)]),
    password: new FormControl(null, [Validators.minLength(6)]),
    confirmPassword: new FormControl(null),
    officePhoneNumber: new FormControl(null, [Validators.maxLength(10), Validators.minLength(8)]),
    officePhoneCountryCode: new FormControl('971'),
    locationPoint: new FormControl([1, 2]),
    unitNo: new FormControl(''),
    floorNo: new FormControl(''),
    street: new FormControl(''),
    area: new FormControl(''),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    deliveryLocation: new FormControl([]),
    reason: new FormControl(''),
    isStandalone: new FormControl(false),
    commission: new FormControl('', [Validators.required]),
    minOrder: new FormControl('', [Validators.required]),
    workStartTime: new FormControl(),
    workEndTime: new FormControl(),
    companyId: new FormControl(),
    contactPerson: new FormArray([]),
    isOnBoarded: new FormControl(false),
    media: new FormArray([], [Validators.required, Validators.minLength(3)]),
    trnNumber: new FormControl(''),
    billToEmail: new FormControl('', [Validators.pattern(OPTIONS.emailPattern)])
  });
  onBoardingType = onBoardingRoles;
  loading = false;

  passwordType = 'password';
  showEye: boolean = false;
  passwordType2 = 'password';
  showEye2: boolean = false;

  user: any = {};
  countryList = [];
  phoneCodeList: Array<any> = [];
  cityList = [];
  itemsAsObjects = [];
  companyList = [];
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  zoom = 4;


  markers = { lat: 0, lng: 0, alpha: 1 };

  errorMessages = profileFromErrors;
  displayMessage: string = null;
  contactPerson = this.profileForm.get('contactPerson') as FormArray;
  secondContactperson = this.profileFormAr.get('contactPerson') as FormArray;
  media = this.profileForm.get('media') as FormArray;
  editableDeliveryLocation: boolean = false;
  isEditable: boolean = false;
  showUpload: boolean = false;
  selectDocumentIndex: number;
  // mediaTypes : Array<any> = [];
  mediaTypes = [{ name: "national_id_card", displayName: 'national_id_card' }, { name: "trade_license", displayName: 'trade_license' }, { name: "trn_certificate", displayName: 'trn_certificate' },]
  subscription: Subscription;
  role: string;
  active: number = 1;
  setDirection: boolean = false;
  language: any;
  tab_title_1: any;
  tab_title_2: any;
  contact_1 = []
  contact_2 = []

  @ViewChild('search')
  public searchElementRef: ElementRef;
  token: any;

  constructor(private fb: FormBuilder, private metaDataService: MetadataService,
    private toastService: ToastService, config: NgbDropdownConfig, private spinner: SpinnerService, private uploadService: UploadService,
    private route: ActivatedRoute, private onboardingService: OnboardingService, private location: Location,
    private modalService: NgbModal, private configModal: NgbModalConfig, private restaurantService: RestaurantService, public translate: TranslateService, public languageService: LanguageService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,private transationService: TranslationService) {

    // customize default values of drop downs used by this component tree
    config.placement = 'bottom';
    config.autoClose = false;
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
    this.getCountries();
    this.getCompany();
    this.getSelectedLanguage();
    this.language = localStorage.getItem("language");
    window.addEventListener('storage', () => {
      // When local storage changes, dump the list to
      // the console.
      console.log(window.localStorage.getItem("language"));
    })

    this.mapsAPILoader.load().then(() => {

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);

      console.log("autocomplete.getPlace() = " + autocomplete.getPlace());

      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          console.log("place = " + place);

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.addMarker(this.latitude, this.longitude);
          this.zoom = 22;
        });
      });
    });
  }

  ngOnDestroy() {
    this.spinner.stop();
    this.subscription.unsubscribe();
    this.profileForm.reset()
  }

  get form() {
    return this.profileForm.controls;
  }

  get secondForm() {
    return this.profileFormAr.controls;
  }
  /**
   * toggle form
   */
  enableFrom() {
    if (this.form.id.value) {
      this.isEditable = !this.isEditable;
      this.editableDeliveryLocation = !this.editableDeliveryLocation;
      if (this.profileForm.enabled) {
        this.profileForm.disable();
      } else {
        this.profileForm.enable();
      }
    } else {
      this.goBack();
    }
  }
  /**
  * hide and un-hide password
  */
  onClickEye() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.showEye = true;
    } else {
      this.passwordType = 'password';
      this.showEye = false;
    }
  }
  onClickEye2() {
    if (this.passwordType2 === 'password') {
      this.passwordType2 = 'text';
      this.showEye2 = true;
    } else {
      this.passwordType2 = 'password';
      this.showEye2 = false;
    }
  }

  /**
   * check the role name
   * @returns label name
   */
  checkRoleName(): string {
    if (this.form.role.value.match('RESTAURANT_SUPER_ADMIN')) {
      this.translate.get(`onBoarding.company`).subscribe((value) => {
        this.role = value
      })
      return 'role';
    }
    else if (this.form.role.value.match('RESTAURANT_ADMIN')) {
      this.translate.get('onBoarding.restaurant').subscribe((value) => {
        this.role = value
      })
      return 'restaurant';
    }
    else {
      this.translate.get(`onBoarding.supplier`).subscribe((value) => {
        this.role = value
      })
      return 'supplier';
    }
  }
  setStandAlone($event: any = false) {
    this.form.isStandalone.setValue($event === ('true'));
    if (this.form.role.value.match('RESTAURANT_ADMIN') && !this.form.isStandalone) {
      this.form.isStandalone.setValidators([Validators.required]);
      this.form.companyId.setValidators([Validators.required]);
    }
    else {
      this.form.isStandalone.clearValidators();
      this.form.companyId.clearValidators();
    }
    this.form.isStandalone.updateValueAndValidity();
    this.form.companyId.updateValueAndValidity();
  }
  setOfficeValidator() {
    if (this.form.officePhoneCountryCode.value) {
      this.form.officePhoneNumber.setValidators([Validators.minLength(8), Validators.maxLength(10)]);
    }
    else {
      this.form.officePhoneNumber.clearValidators();
    }
    this.form.officePhoneNumber.updateValueAndValidity();
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
      this.contactPerson = this.profileForm.get('contactPerson') as FormArray;
    }
    this.form.firstName.updateValueAndValidity();
    this.form.lastName.updateValueAndValidity();
    this.setStandAlone();
    this.checkRoleName();
  }
  getCompany() {
    if (this.companyList.length === 0) {
      this.spinner.start();
      this.metaDataService.getCompany().subscribe(result => {
        this.companyList = result;
        this.spinner.stop();
      }, error => {
        this.spinner.stop();
      })
    }
  }
  getParams() {
    this.route.params.subscribe(params => {
      if (params['id'] && params['role'] === 's') {
        this.form.role.setValue('SUPPLIER');
        this.getProfileSupplier(params['id']);
      }
      else if (params['id'] && params['role'] === 'r') {
        this.form.role.setValue('RESTAURANT_ADMIN');
        // this.profileForm.addControl('deliveryInstruction', new FormControl(''));
        this.getProfileRestaurant(params['id']);
      }
      else if (params['id'] && params['role'] === 'c') {
        this.form.role.setValue('RESTAURANT_SUPER_ADMIN');
        this.getProfileCompany(params['id']);
      }
      else {
        this.form.password.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.confirmPassword.setValidators([Validators.required]);
        this.isEditable = true;
        this.editableDeliveryLocation = true;
        this.spinner.stop();
      }
      this.setValidators();
      this.form.confirmPassword.updateValueAndValidity();
    })
  }
  /**
   * get supplier profile
   */
  getProfileSupplier(id) {
    this.onboardingService.getProfileSupplier(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      this.profileForm.controls.Aname.setValue(userData.nameTranslation.ar);
      this.profileForm.controls.name.setValue(userData.nameTranslation.en);
      this.profileForm.controls.deliveryLocation.setValue(userData.deliveryLocation.map(element => ({
        label: element.label
      })))
      this.user = userData;
      this.user.role = this.form.role.value;
      userData.contactPerson.forEach(element => {
        this.contactPerson.push(this.fb.group({
          fullName: new FormControl(element.fullName),
          email: new FormControl(element.email),
          mobileCode: new FormControl(element.mobileCode),
          mobileNumber: new FormControl(element.mobileNumber),
          title: new FormControl(element.title),
        }))
        this.contactPerson.disable();
      });
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      for (let i = 0; i < this.mediaTypes.length; i++) {
        let element = userData.media.find(x => x.fileType === this.mediaTypes[i].name);
        if (element) {
          this.media.controls[i].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        } else {
          this.media.controls[i].setValue({
            path: null,
            name: null,
            id: null,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        }
      }
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
      this.profileForm.controls.Aname.setValue(userData.nameTranslation.ar);
      this.profileForm.controls.name.setValue(userData.nameTranslation.en);

      this.user = userData;
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      this.user.role = this.form.role.value;
      for (let i = 0; i < this.mediaTypes.length; i++) {
        let element = userData.media.find(x => x.fileType === this.mediaTypes[i].name);
        if (element) {
          this.media.controls[i].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        } else {
          this.media.controls[i].setValue({
            path: null,
            name: null,
            id: null,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        }
      }
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
  getProfileCompany(id) {
    this.onboardingService.getProfileCompany(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      this.profileForm.controls.Aname.setValue(userData.nameTranslation.ar);
      this.profileForm.controls.name.setValue(userData.nameTranslation.en);

      this.user = userData;
      if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
        this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
      }
      this.user.role = this.form.role.value;
      for (let i = 0; i < this.mediaTypes.length; i++) {
        let element = userData.media.find(x => x.fileType === this.mediaTypes[i].name);
        if (element) {
          this.media.controls[i].setValue({
            path: element.filePath,
            name: element.fileName,
            id: element.id,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        } else {
          this.media.controls[i].setValue({
            path: null,
            name: null,
            id: null,
            fileType: this.mediaTypes[i].name,
            displayName: this.mediaTypes[i].displayName,
          });
        }
      }
      this.setCountry(userData.countryName);
      this.profileForm.disable();

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
    this.metaDataService.getCountries().subscribe((data: any[]) => {
      this.phoneCodeList = data;
      this.countryList = data.slice(0, 3);
      if (localStorage.getItem('region').toString().match('SA')) {
        this.form.mobileCode.setValue(this.phoneCodeList[1].dail_code);
        this.form.officePhoneCountryCode.setValue(this.phoneCodeList[1].dail_code);
      }
      if (localStorage.getItem('region').toString().match('KW')) {
        this.form.mobileCode.setValue(this.phoneCodeList[1].dail_code);
        this.form.officePhoneCountryCode.setValue(this.phoneCodeList[1].dail_code);
      }
      let country = this.countryList.find(c => c.code2l === localStorage.getItem('region'));
      this.form.countryCode.setValue(country.code2l);
      this.form.countryName.setValue(country.name);
      this.setCountry(country.name);
      this.getParams();
    })
  }
  /**
   * set country
   * @param name 
   */
  setCountry(name) {
    let country = this.countryList.find(c => c.name === (name));
    this.form.countryCode.setValue(country.code2l);
    this.cityList = csc.getCitiesOfCountry(country.code2l);
  }
  /**
   * add contact person
   */
  addContactPerson() {
    if (!this.isEditable) {
      return;
    }
    this.contactPerson.push(this.fb.group({
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
    this.contactPerson.removeAt(index)
  }

  /**
   * return the banner url
   * @returns 
   */
  getUrl() {
    return this.user?.banner != null ? `url(${this.user?.banner})` : 'url(assets/images/background.svg)';
  }
  toggleUpload() {
    this.showUpload = !this.showUpload;
  }
  addDocument(index) {
    if (this.isEditable) {
      this.showUpload = true;
      this.selectDocumentIndex = index;
    }
  }
  /**
  * upload documents
  * @param event 
  * @param type 
  */
  uploadDocument(event) {
    this.displayMessage = null;
    let file = event;
    if (this.uploadService.checkDocumentType(file)) {
      this.displayMessage = OPTIONS.documentType;
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
      this.media.controls[this.selectDocumentIndex].setValue({
        id: this.media.controls[this.selectDocumentIndex].value.id,
        path: obj.data.key,
        name: obj.data.originalname,
        fileType: this.mediaTypes[this.selectDocumentIndex].name,
        displayName: this.mediaTypes[this.selectDocumentIndex].displayName
      });
      this.spinner.stop();
      this.showUpload = false;
      this.displayMessage = null;
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
   * upload images
   * @param event 
   * @param type 
   */
  uploadImage(event, type) {
    let file = event;
    if (this.uploadService.checkImageType(file)) {
      this.displayMessage = OPTIONS.documentType;
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
      if (type.match('logo')) {
        this.form.logo.setValue(obj.data.key);
        this.user.logo = obj.cdn;
      }
      else {
        this.form.banner.setValue(obj.data.key);
        this.user.banner = obj.cdn;
      }
      this.spinner.stop();
      this.displayMessage = null;
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
    if (!this.profileForm.value.name && !this.profileForm.value.Aname) {
      this.toastService.error('Please enter Arabic or English Name');
      return;
    }
    if (this.form.isStandalone.value === true) {
      this.form.companyId.clearValidators();
      this.form.companyId.updateValueAndValidity();
    }
    console.log(this.profileFormAr.value);
    this.displayMessage = null;
    // if (this.profileFormAr.invalid) {
    //   validateField(this.profileFormAr);
    //   return;
    // }
    // var lang = localStorage.getItem('language');
    // var arabic = /[\u0600-\u06FF\u0750-\u077F]/;
    // if (lang == 'en') {
    //   if (arabic.test(this.secondForm.firstName.value || this.secondForm.lastName.value || this.secondForm.name.value)) {
    //     // console.log("arabic")
    //   } else {
    //     this.displayMessage = "please enter in arabic";
    //     return;
    //   }
    // } else if (lang == 'ar') {
    //   if (arabic.test(this.secondForm.firstName.value || this.secondForm.lastName.value || this.secondForm.name.value)) {
    //     this.displayMessage = "please enter in english";
    //     return;
    //   } else {
    //     // console.log("english")
    //   }
    // }
    this.loading = true;
    if (!this.form.id.value) {
      if (this.form.role.value.match('SUPPLIER')) {
        this.addSupplier();
      }
      if (this.form.role.value.match('RESTAURANT_ADMIN')) {
        this.addRestaurant();
      }
      if (this.form.role.value.match('RESTAURANT_SUPER_ADMIN')) {
        this.addCompany();
      }
    }
    else {
      if (this.form.role.value.match('SUPPLIER')) {
        this.updateSupplier();
      }
      if (this.form.role.value.match('RESTAURANT_ADMIN')) {
        this.updateRestaurant();
      }
      if (this.form.role.value.match('RESTAURANT_SUPER_ADMIN')) {
        this.updateCompany();
      }
    }
  }

  /* generation of translation data */
  addTranslation() {
    var l = localStorage.getItem('language');
    let content_one = {};
    let content_two = {};
    content_one = {
      [this.form.firstName.value]: this.secondForm.firstName.value,
      [this.form.lastName.value]: this.secondForm.lastName.value,
      [this.form.name.value]: this.secondForm.name.value,
      [this.form.area.value]: this.secondForm.area.value,
      [this.form.street.value]: this.secondForm.street.value,
      [this.form.reason.value]: this.secondForm.reason.value
    };

    content_two = {
      [this.form.firstName.value]: this.form.firstName.value,
      [this.form.lastName.value]: this.form.lastName.value,
      [this.form.name.value]: this.form.name.value,
      [this.form.area.value]: this.form.area.value,
      [this.form.street.value]: this.form.street.value,
      [this.form.reason.value]: this.form.reason.value
    }
    for (var key in content_one) {
      if (content_one[key] == "" || content_one[key] == null || content_one[key] == undefined) {
        delete content_one[key];
      }
    }
    for (var key in content_two) {
      if (content_two[key] == "" || content_two[key] == null || content_two[key] == undefined) {
        delete content_two[key];
      }
    }
    let translationData_1 = {
      langCode: l == 'ar' ? 'en' : 'ar',
      content: content_one
    }
    let translationData_2 = {
      langCode: l == 'ar' ? 'ar' : 'en',
      content: content_two
    }
    // console.log("jSON", translationData_1);
    // console.log("json2", translationData_2);
    this.transationService.addTranslations(translationData_1).subscribe(value => {
      console.log(value);
    }, error => {
      console.log(error);
    })
    this.transationService.addTranslations(translationData_2).subscribe(value => {
      console.log(value);
    }, error => {
      console.log(error);
    })
  }

  /**
   * open confirm
   */
  openConfirm() {
    let text = this.user.status == 'unapproved' ? 'reject' : 'approve';
    this.user.status == 'unapproved' ? 'reject' : 'approved';
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this ${this.checkRoleName()} ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    // modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.onSubmitStatus();
    })
  }
  /**
   * open reject
   */
  openReject() {
    const modalRef = this.modalService.open(OnboardingRejectComponent, { centered: true });
    modalRef.componentInstance.userData = this.profileForm.value;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.location.back();
    })
  }
  /**
   * change status(approve/reject)
   */
  onSubmitStatus() {
    if (this.form.role.value.match('supplier')) {
      this.approvedRejectSupplier();
    }
    if (this.form.role.value.match('restaurant')) {
      this.approvedRejectRestaurant();
    }
    if (this.form.role.value.match('company')) {
      this.approvedRejectCompany();
    }
  }
  /**
   * add supplier
   */
  addSupplier() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
   // this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.addSupplier(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * update supplier
   */
  updateSupplier() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
   // this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.updateSupplier(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * approve/reject supplier
   */
  approvedRejectSupplier() {
    this.onboardingService.approveRejectSupplier(this.user).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * add restaurant
   */
  addRestaurant() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
   // this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.addRestaurant(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * update restaurant
   */
  updateRestaurant() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
   // this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.updateRestaurant(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
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
    this.onboardingService.approveRejectRestaurant(this.user).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * add company
   */
  addCompany() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
    //this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.addCompany(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * update company
   */
  updateCompany() {
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
   //this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.updateCompany(data).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.addTranslation();
        this.toastService.success(data);
        this.showUpload = false;
        this.goBack();
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
    this.onboardingService.approveRejectCompany(this.user).pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data.message);
        this.showUpload = false;
        this.goBack();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }
  /**
   * download file
   * @param data 
   */
  downloadFile(data) {
    saveAs(data.path, data.originalname, { autoBom: true });
  }

  addMarker(lat: number, lng: number) {
    this.markers = { lat: lat, lng: lng, alpha: 1 };
  }
  mapClicked($event) {
    this.form.locationPoint.setValue([$event.coords.lat, $event.coords.lng]);
    this.getGeoLocation($event.coords.lat, $event.coords.lng);
  }
  getGeoLocation(lat: number, lng: number) {
    if (navigator.geolocation) {
      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(lat, lng);
      let request: any = {
        latLng: new google.maps.LatLng(lat, lng)
      };
      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          let result = results[0];
          let rsltAdrComponent: any = result.address_components;
          let resultLength = rsltAdrComponent.length;
          if (result != null) {
            let address = result.formatted_address;
            this.form.location.setValue(address);
            this.addMarker(lat, lng)
          } else {
            alert("No address available!");
          }
        }
      });
    }
  }
  goBack() {
    this.location.back();
  }

  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (this.active == 2) {
        this.nav.select(1);
      }
      if (l == 'ar') {
        this.tab_title_1 = 'ar';
        this.tab_title_2 = 'en';
        this.setDirection = true;
      }
      if (l == 'en') {
        this.tab_title_1 = 'en';
        this.tab_title_2 = 'ar';
        this.setDirection = false;
      }
    })
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
      this.uploadDocument(files[0]);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }

  /* navigation to second tab, valudations, disable fields and patching the values */
  selectTab() {
    let index = 0;
    for (let i = 0; i < this.media.controls.length; i++) {
      if (this.media.controls[i].value.name) {
        index++;
      }
    }
    if (this.profileForm.invalid) {
      validateField(this.profileForm);
      return;
    } else if (this.form.password.value && this.form.confirmPassword.value != this.form.password.value) {
      this.displayMessage = this.translate.instant("translations.password");
      return;
    }
    else if (index != this.media.controls.length) {
      this.displayMessage = this.translate.instant("translations.documents");
      return;
    } else {
      this.setFormLanguage();
      this.checkRoleName();
      this.language = localStorage.getItem('language');
      this.nav.select(2);
      if (this.language == "en") {
        this.setDirection = true;
      } else {
        this.setDirection = false;
      }
      this.profileFormAr.controls['role'].disable();
      this.profileFormAr.controls['logo'].disable();
      this.profileFormAr.controls['banner'].disable();
      this.profileFormAr.controls['email'].disable();
      this.profileFormAr.controls['isOnBoarded'].disable();
      this.profileFormAr.controls['mobileCode'].disable();
      this.profileFormAr.controls['mobileNumber'].disable();
      this.profileFormAr.controls['password'].disable();
      this.profileFormAr.controls['confirmPassword'].disable();
      this.profileFormAr.controls['officePhoneNumber'].disable();
      this.profileFormAr.controls['officePhoneCountryCode'].disable();
      this.profileFormAr.controls['locationPoint'].disable();
      this.profileFormAr.controls['unitNo'].disable();
      this.profileFormAr.controls['floorNo'].disable();
      this.profileFormAr.controls['isStandalone'].disable();
      this.profileFormAr.controls['commission'].disable();
      this.profileFormAr.controls['minOrder'].disable();
      this.profileFormAr.controls['workStartTime'].disable();
      this.profileFormAr.controls['workEndTime'].disable();
      this.profileFormAr.controls['companyId'].disable();
      this.profileFormAr.controls['media'].disable();
      this.profileFormAr.controls['city'].disable();
      this.profileFormAr.controls['location'].disable();
      this.profileFormAr.controls['trnNumber'].disable();
      this.profileFormAr.controls['billToEmail'].disable();

      if (!this.form.id.value) {
        this.profileFormAr.patchValue(this.profileForm.value);
      } else {
        console.log(this.profileForm.value)
        var l;
        this.language == "en" ? l = "ar" : l = "en";
        this.transationService.getTranslationFile(l).subscribe(value => {
          for (var key in value) {
            if (this.form.name.value == key) {
              this.secondForm.name.patchValue(value[key])
            }
            if (this.form.firstName.value == key) {
              this.secondForm.firstName.patchValue(value[key])
            }
            if (this.form.lastName.value == key) {
              this.secondForm.lastName.patchValue(value[key])
            }
            if (this.form.street.value == key) {
              this.secondForm.street.patchValue(value[key])
            }
            if (this.form.area.value == key) {
              this.secondForm.area.patchValue(value[key])
            }
            if (this.form.reason.value == key) {
              this.secondForm.reason.patchValue(value[key])
            }
          }
        },
          error => {
            console.log(error);
          })
        this.secondForm.id.patchValue(this.form.id.value)
        this.secondForm.role.patchValue(this.form.role.value);
        this.secondForm.email.patchValue(this.form.email.value);
        this.secondForm.isOnBoarded.patchValue(this.form.isOnBoarded.value);
        this.secondForm.mobileCode.patchValue(this.form.mobileCode.value);
        this.secondForm.mobileNumber.patchValue(this.form.mobileNumber.value);
        this.secondForm.password.patchValue(this.form.password.value);
        this.secondForm.confirmPassword.patchValue(this.form.confirmPassword.value);
        this.secondForm.officePhoneNumber.patchValue(this.form.officePhoneNumber.value);
        this.secondForm.officePhoneCountryCode.patchValue(this.form.officePhoneCountryCode.value);
        this.secondForm.locationPoint.patchValue(this.form.locationPoint.value);
        this.secondForm.location.patchValue(this.form.location.value);
        this.secondForm.unitNo.patchValue(this.form.unitNo.value);
        this.secondForm.floorNo.patchValue(this.form.floorNo.value);
        this.secondForm.isStandalone.patchValue(this.form.isStandalone.value);
        this.secondForm.companyId.patchValue(this.form.companyId.value);
        this.secondForm.city.patchValue(this.form.city.value);
        this.secondForm.countryCode.patchValue(this.form.countryCode.value);
        this.secondForm.countryName.patchValue(this.form.countryName.value);
        this.secondForm.commission.patchValue(this.form.commission.value);
        this.secondForm.minOrder.patchValue(this.form.minOrder.value);
        this.secondForm.workStartTime.patchValue(this.form.workStartTime.value);
        this.secondForm.workEndTime.patchValue(this.form.workEndTime.value);
        this.secondForm.trnNumber.patchValue(this.form.trnNumber.value);
        this.secondForm.billToEmail.patchValue(this.form.billToEmail.value);
      }
    }
  }

  /* navigation to first tab */
  selectTab1() {
    this.checkRoleName();
    this.setDirection = !this.setDirection;
    if (this.active == 2) {
      this.nav.select(1);
    }
  }

  /* set language on specific tabs */
  setFormLanguage() {
    this.language = localStorage.getItem('language');
    if (this.language == 'ar' && this.tab_title_2 == 'en') {
      this.translate.getTranslation('en').subscribe((value) => {
        //console.log(value);
      })
    }
    if (this.language == 'en' && this.tab_title_2 == 'ar') {
      this.translate.getTranslation('ar').subscribe((value) => {
        //console.log(value);
      })
    }
  }

}
