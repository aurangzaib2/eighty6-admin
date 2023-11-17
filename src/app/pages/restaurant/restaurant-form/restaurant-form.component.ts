import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantService, UploadService } from '../../../core';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { coordinates, OPTIONS, profileFromErrors } from '../../../helpers';
import { MetadataService } from '../../../core/services/metadata.service';
import csc from 'country-state-city';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';
import { validateField } from '../../../shared/validators/form.validator';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.scss']
})
export class RestaurantFormComponent implements OnInit {

  profileForm = new FormGroup({
    id: new FormControl(null),
    role: new FormControl(''),
    logo: new FormControl(),
    banner: new FormControl(),
    logoCDN: new FormControl(),
    bannerCDN: new FormControl(),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    name: new FormControl(''),
    Aname: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    password: new FormControl('', [Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
    officePhoneNumber: new FormControl('', [Validators.minLength(8), Validators.maxLength(15)]),
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
    deliveryInstruction: new FormControl(),
    contactPerson: new FormArray([]),
    media: new FormArray([], [Validators.required, Validators.minLength(1)]),
    trnNumber: new FormControl(''),
    billToEmail: new FormControl('', [Validators.pattern(OPTIONS.emailPattern)])
  });
  restaurantData: any = {};
  loading = false;
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  countryList = [];
  phoneCodeList = [];
  cityList = [];
  zoom = 4;
  errorMessages = profileFromErrors;
  displayMessage: string = null;
  contactPerson = this.profileForm.get('contactPerson') as FormArray;
  media = this.profileForm.get('media') as FormArray;
  editableDeliveryLocation: boolean = false;
  isEditable: boolean = true;
  showUpload: boolean = false;
  selectDocumentIndex: number;
  mediaTypes = [{ name: "national_id_card", displayName: '' }, { name: "trade_license", displayName: '' }, { name: "trn_certificate", displayName: '' },]
  subscription: Subscription;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  
  markers = { lat: 0, lng: 0, alpha: 1 };
  itemsAsObjects = [];
  companyData = { id: null, name: null };
  token: any;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router, private fb: FormBuilder,
    private route: ActivatedRoute, private location: Location, private modalService: NgbModal, private metaDataService: MetadataService,
    private spinner: SpinnerService, private uploadService: UploadService, private onboardingService: OnboardingService,
    private toastService: ToastService, public translate: TranslateService, public languageService: LanguageService,
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
  get form() {
    return this.profileForm.controls;
  }
  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getCountries();

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

  getParams() {
    this.route.queryParams.subscribe(params => {
      if (params['rid']) {
        this.companyData = {
          id: params['id'],
          name: params['cn']
        }
        this.getRestaurantData(params['rid']);
      }
    })
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
    let country = this.countryList.find(c => c.name === (name));
    this.form.countryCode.setValue(country.code2l);
    this.cityList = csc.getCitiesOfCountry(country.code2l);
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
  getRestaurantData(id) {
    this.onboardingService.getProfileRestaurant(id).subscribe((restaurantDataData) => {
      this.restaurantData = restaurantDataData;
      this.patchForm(restaurantDataData);
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  patchForm(userData) {
    this.profileForm.patchValue(userData);

    this.restaurantData.role = this.form.role.value;
    this.form.logoCDN.setValue(this.restaurantData.logo);
    this.form.bannerCDN.setValue(this.restaurantData.banner);
    this.profileForm.controls.Aname.setValue(userData.nameTranslation.ar);
    this.profileForm.controls.name.setValue(userData.nameTranslation.en);

    // if (userData.contactPerson) {
    //   userData.contactPerson.forEach(element => {
    //     this.contactPerson.push(this.fb.group({
    //       fullName: new FormControl(element.fullName),
    //       email: new FormControl(element.email),
    //       mobileCode: new FormControl(element.mobileCode),
    //       mobileNumber: new FormControl(element.mobileNumber),
    //       title: new FormControl(element.title),
    //     }))
    //     this.contactPerson.disable();
    //   });
    // }
    if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
      this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
    }
    if (userData.media) {
      this.mediaTypes.forEach((element, index) => {
        let media = userData.media.find(x => x.fileType === element.name);
        if (media) {
          this.media.controls[index].setValue({
            path: media.filePath,
            name: media.fileName,
            id: media.id,
            fileType: this.mediaTypes[index].name,
            displayName: this.mediaTypes[index].displayName,
          });
        }
        else {
          this.media.controls[index].setValue({
            path: null,
            name: null,
            id: null,
            fileType: this.mediaTypes[index].name,
            displayName: this.mediaTypes[index].displayName,
          });
        }
      })
    }
    this.setCountry(userData.countryName);
    this.spinner.stop();
  }

  /**
   * update restaurant
   */
  onSubmit() {
    this.setOfficeValidator();
    this.displayMessage = null;
    // console.log(this.profileForm.value)
    this.form.locationPoint.setValue([this.markers.lat, this.markers.lng])

    if (this.profileForm.invalid) {
      validateField(this.profileForm);
      return;
    }
    this.loading = true;
    let nameTranslation = {
      en: this.profileForm.value.name,
      ar: this.profileForm.value.Aname,
    }
    this.profileForm.removeControl('Aname');
    let data = this.profileForm.value;
    data.nameTranslation = nameTranslation;
    this.onboardingService.updateRestaurant(data).subscribe(
      data => {
        this.loading = false;
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

  //
  /**
   * return the banner url
   * @returns 
   */
  getUrl() {
    return this.restaurantData?.banner != null ? `url(${this.restaurantData?.banner})` : 'url(assets/images/placeholder_banner.jpg)';
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
      if (type.match('logo')) {
        this.form.logo.setValue(obj.data.key);
        this.restaurantData.logo = obj.cdn;
      }
      else {
        this.form.banner.setValue(obj.data.key);
        this.restaurantData.banner = obj.cdn;
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
  goBackTwice() {
    this.router.navigate(['/company/restaurant/list'], { queryParams: { id: this.restaurantData.company.id, cn: this.restaurantData.company.name } });
  }
  ngOnDestroy() {
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
