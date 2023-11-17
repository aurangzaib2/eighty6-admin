import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UploadService, RestaurantService, UserService } from '../../../core';
import { LanguageService } from '../../../core/services/language.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { OPTIONS, onBoardingRoles, coordinates, profileFromErrors, confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { validateField } from '../../../shared/validators/form.validator';
import { OnboardingRejectComponent } from '../../onboarding/onboarding-reject/onboarding-reject.component';
import csc from 'country-state-city';
import { Location } from '@angular/common';
import { SendBirdService } from '../../../core/services/sendbird.service';
import { saveAs } from 'file-saver';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {

  profileForm = new FormGroup({
    id: new FormControl(null),
    logo: new FormControl(),
    banner: new FormControl(),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('971', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(15), Validators.minLength(8)]),
    password: new FormControl('', [Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
    officePhoneNumber: new FormControl(null, [Validators.maxLength(15), Validators.minLength(8)]),
    officePhoneCountryCode: new FormControl(),
    locationPoint: new FormControl([1, 2]),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    isStandalone: new FormControl(false),
    media: new FormArray([], [Validators.required, Validators.minLength(3)]),
    trnNumber: new FormControl(''),
  });
  onBoardingType = onBoardingRoles;
  loading = false;

  passwordType = 'password';
  showEye: boolean = false;
  passwordType2 = 'password';
  showEye2: boolean = false;

  user: any = {};
  countryList = [];
  phoneCodeList = [];
  cityList = [];
  itemsAsObjects = [];
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;

  markers = { lat: 0, lng: 0, alpha: 1 };
  zoom = 4;
  errorMessages = profileFromErrors;
  displayMessage: string = null;
  media = this.profileForm.get('media') as FormArray;
  isEditable: boolean = false;
  showUpload: boolean = false;
  selectDocumentIndex: number;
  // mediaTypes : Array<any> = [];
  mediaTypes = [{ name: "national_id_card", displayName: '' }, { name: "trade_license", displayName: '' }, { name: "trn_certificate", displayName: '' },]
  subscription: Subscription;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  token: any;

  constructor(private fb: FormBuilder, private metaDataService: MetadataService,private router: Router,
    private toastService: ToastService, config: NgbDropdownConfig, private spinner: SpinnerService, private uploadService: UploadService,
    private route: ActivatedRoute, private onboardingService: OnboardingService, private location: Location, private sendBirdService: SendBirdService, private userService: UserService,
    private modalService: NgbModal, private configModal: NgbModalConfig, private restaurantService: RestaurantService, public translate: TranslateService, public languageService: LanguageService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) {

    // customize default values of dropdown used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
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
    this.getSelectedLanguage();

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

  get form() {
    return this.profileForm.controls;
  }
  /**
   * toggle form
   */
  enableFrom() {
    if (this.form.id.value) {
      this.isEditable = !this.isEditable;
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

  setOfficeValidator() {
    if (this.form.officePhoneCountryCode.value) {
      this.form.officePhoneNumber.setValidators([Validators.minLength(8), Validators.maxLength(15)]);
    }
    else {
      this.form.officePhoneNumber.clearValidators();
    }
    this.form.officePhoneNumber.updateValueAndValidity();
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.getProfileCompany(params['id']);
      }
    })
  }
  /**
  * get company profile
  */
  getProfileCompany(id) {
    this.onboardingService.getProfileCompany(id).subscribe((userData) => {
      this.profileForm.patchValue(userData);
      this.user = userData;
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
   * get all the countries
   */
  getCountries() {
    this.spinner.start();
    this.metaDataService.getCountries().subscribe((data: any[]) => {
      this.phoneCodeList = data;
      this.countryList = data.slice(0, 2);
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
   * return the banner url
   * @returns 
   */
  getUrl() {
    return 'assets/images/banner.png';
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
    this.displayMessage = null;
    if (this.profileForm.invalid) {
      validateField(this.profileForm);
      return;
    }
    if (this.form.password.value && this.form.confirmPassword.value != this.form.password.value) {
      this.displayMessage = 'Password & confirm password didn\'t match';
      return;
    }
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
    this.loading = true;
    this.updateCompany();
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
   * update company
   */
  updateCompany() {
    this.onboardingService.updateCompany(this.profileForm.value).subscribe(
      data => {
        this.loading = false;
        this.toastService.success(data);
        this.showUpload = false;
        this.enableFrom();
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }

  /**
   * open confirm
   */
  openConfirmStatus() {
    let text = this.user.status == 'active' ? 'block' : 'un-block';
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this company ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.updateCompanyStatus();
    })
  }
  /**
   * approve/reject comapany
   */
  updateCompanyStatus() {
    this.spinner.start();
    this.restaurantService.updateCompanyStatus(this.user).subscribe(
      data => {
        this.spinner.stop();
        this.toastService.success(data.message);
        this.getParams();
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }
  /**
  * open modal to confirm delete
  */
  openConfirmDelete() {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description = confirmMessages.deleteDescription + ` this company ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.deleteRequest();
    })
  }
  /**
   * delete company request
   * @param  
   */
  deleteRequest() {
    this.spinner.start();
    this.restaurantService.deleteCompany(this.user.id).subscribe(result => {
      this.toastService.success(result.message);
      this.spinner.stop();
      this.goBack();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    })
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

  ngOnDestroy() {
    this.spinner.stop();
    this.subscription.unsubscribe();
  }

  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (l == 'ar') {
        this.translate.use(l)
        for (let i = 0; i < this.mediaTypes.length; i++) {
          const element = this.mediaTypes[i];
          this.translate.get(`onBoarding.${element.name}`).subscribe((value) => {
            element.displayName = value
            this.media.controls[i].get('displayName').setValue(value)
          })
        }
      }

      if (l == 'en') {
        this.translate.use(l)
        for (let i = 0; i < this.mediaTypes.length; i++) {
          const element = this.mediaTypes[i];
          this.translate.get(`onBoarding.${element.name}`).subscribe((value) => {
            element.displayName = value
            this.media.controls[i].get('displayName').setValue(value)
          })
        }
      }
    })
  }

  startChat() {
    this.spinner.start();
    this.userService.currentUser.subscribe((user) => {
      let params = {
        role: 'company',
        id: this.user.id
      }
      this.userService.getUserId(params).subscribe(data => {
        let ids = [data.id.toString(), user.id.toString()];
        let name = `${user.firstName} ${user.lastName}`;
        let DATA = {
          sender: `${user.firstName} ${user.lastName}`,
          receiver: this.user.name
        };
        this.sendBirdService.getChannelVieUser(ids).then((channel) => {
          if (channel.length === 0) {
            this.sendBirdService.createChannel(ids, name, DATA).then((channel) => {
              this.spinner.stop();
              this.router.navigate(['chat'], { queryParams: { id: channel.url } })
            }).catch((error) => {
              this.spinner.stop();
              this.toastService.error('Opps, something went wrong !!')
            });
          }
          else {
            this.spinner.stop();
            this.router.navigate(['chat'], { queryParams: { id: channel[0].url } })
          }
        }).catch((error) => {
          this.spinner.stop();
          this.toastService.error('Opps, something went wrong !!')
        });
      })
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

}
