import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbDropdownConfig, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { coordinates } from '../../../helpers';
import { saveAs } from 'file-saver';
import { SupplierService } from '../../../core/services/supplier.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-info',
  templateUrl: './supplier-info.component.html',
  styleUrls: ['./supplier-info.component.scss']
})
export class SupplierInfoComponent implements OnInit {

  supplierData: any = {};
  profileForm = new FormGroup({
    id: new FormControl(null),
    supplierId: new FormControl(),
    role: new FormControl('', [Validators.required]),
    logo: new FormControl(),
    banner: new FormControl(),
    logoCDN: new FormControl(),
    bannerCDN: new FormControl(),
    name: new FormControl('', [Validators.required]),
    Aname: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    mobileCode: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(15)]),
    password: new FormControl('', [Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
    officePhoneNumber: new FormControl('', [Validators.maxLength(15)]),
    officePhoneCountryCode: new FormControl(),
    locationPoint: new FormControl([1, 2]),
    city: new FormControl('', [Validators.required]),
    countryName: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    contactPerson: new FormArray([]),
    media: new FormArray([], [Validators.required, Validators.minLength(1)]),
    commission: new FormControl('', [Validators.required]),
    deliveryLocation: new FormControl([]),
    minOrder: new FormControl(),
    workStartTime: new FormControl(),
    workEndTime: new FormControl(),
    isOnBoarded: new FormControl(),
    trnNumber: new FormControl(),
  });
  loading = false;
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  countryList = [];
  cityList = [];
  contactPerson = this.profileForm.get('contactPerson') as FormArray;
  media = this.profileForm.get('media') as FormArray;
  itemsAsObjects = [];
  selectDocumentIndex: number;
  mediaTypes = [{ name: "national_id_card", displayName: '' },{ name: "trade_license", displayName: '' }, { name: "trn_certificate", displayName: '' },]
  subscription:Subscription;

  markers = [];
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private fb: FormBuilder,
    private supplierService: SupplierService, private router: Router,public languageService: LanguageService,public translate: TranslateService) {
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
    this.getData();
  }
  getData() {
    this.supplierService.supplierData$.subscribe(data => {
      this.supplierData = data;
      this.profileForm.patchValue(this.supplierData);
      this.profileForm.controls.Aname.setValue(this.supplierData.nameTranslation.ar);
      this.profileForm.controls.name.setValue(this.supplierData.nameTranslation.en);
      this.supplierData.role = this.form.role.value;
      if (this.supplierData && this.supplierData.deliveryLocation) {
        this.profileForm.controls.deliveryLocation.setValue(this.supplierData.deliveryLocation.map(element => ({
          label: element.label
        })))
      }
      if (this.supplierData && this.supplierData.media) {
        for (let i = 0; i < this.mediaTypes.length; i++) {
          let element = this.supplierData.media.find(x => x.fileType === this.mediaTypes[i].name);
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
    return this.supplierData?.banner != null ? `url(${this.supplierData?.banner})` : 'assets/images/placeholder_banner.jpg';
  }
  edit() {
    this.router.navigate([`/supplier/details`], { queryParams: { id: this.supplierData.id, sn: this.supplierData.name } });
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
           this.translate.get(`onBoarding.${element.name}`).subscribe((value)=>{
            element.displayName = value
            this.media.controls[i].get('displayName').setValue(value)   
          })
           }
      }

      if (l == 'en') {
        this.translate.use(l)
        for (let i = 0; i < this.mediaTypes.length; i++) {
          const element = this.mediaTypes[i];
           this.translate.get(`onBoarding.${element.name}`).subscribe((value)=>{
            element.displayName = value   
            this.media.controls[i].get('displayName').setValue(value) 
          })
           }
      }
    })
  }


}
