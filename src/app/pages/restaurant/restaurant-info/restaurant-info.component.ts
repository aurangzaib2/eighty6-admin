import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantService } from '../../../core';
import { coordinates } from '../../../helpers';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-restaurant-info',
  templateUrl: './restaurant-info.component.html',
  styleUrls: ['./restaurant-info.component.scss']
})
export class RestaurantInfoComponent implements OnInit {

  restaurantData: any = {};
  profileForm = new FormGroup({
    id: new FormControl(null),
    role: new FormControl(''),
    logo: new FormControl(),
    banner: new FormControl(),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    name: new FormControl(''),
    Aname: new FormControl(''),
    email: new FormControl('', [Validators.required]),
    mobileCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(15)]),
    password: new FormControl('', [Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
    officePhoneNumber: new FormControl('', [Validators.maxLength(15)]),
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
    deliveryLocation: new FormArray([]),
    deliveryInstruction: new FormControl(),
    media: new FormArray([], [Validators.required, Validators.minLength(1)]),
    trnNumber: new FormControl(''),
    billToEmail: new FormControl('')    
  });
  loading = false;
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  countryList = [];
  cityList = [];
  deliveryLocation;
  contactPerson;
  media = this.profileForm.get('media') as FormArray;
  selectDocumentIndex: number;
  mediaTypes = [{ name: "national_id_card", displayName: '' }, { name: "trade_license", displayName: '' }, { name: "trn_certificate", displayName: '' },]
  subscription: Subscription;

  markers = [];
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private fb: FormBuilder,
    private location: Location, private restaurantService: RestaurantService, public translate: TranslateService, public languageService: LanguageService) {
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
    this.restaurantService.restaurantData$.subscribe(data => {
      this.restaurantData = data;
      this.profileForm.patchValue(this.restaurantData);
      this.profileForm.controls.Aname.setValue(this.restaurantData.nameTranslation?.ar);
      this.profileForm.controls.name.setValue(this.restaurantData.nameTranslation?.en);

      this.restaurantData.role = this.form.role.value;
      if (this.restaurantData && this.restaurantData.media) {
        for (let i = 0; i < this.mediaTypes.length; i++) {
          let element = this.restaurantData.media.find(x => x.fileType === this.mediaTypes[i].name);
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
        if (this.form.locationPoint.value != null && this.form.locationPoint.value.length > 0) {
          this.addMarker(this.form.locationPoint.value[0], this.form.locationPoint.value[1]);
        }
      }
      this.profileForm.disable();
    })
  }

  /**
   * return the banner url
   * @returns 
   */
  getUrl() {
    return this.restaurantData?.banner != null ? `url(${this.restaurantData?.banner})` : 'assets/images/placeholder_banner.jpg';
  }
  /**
 * download file
 * @param data 
 */
  downloadFile(data) {
    saveAs(data.path, data.originalname, { autoBom: true });
  }

  addMarker(lat: number, lng: number) {
    this.markers.push({ lat, lng, alpha: 1 });
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

}
