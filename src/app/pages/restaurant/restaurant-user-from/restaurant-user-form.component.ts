import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantService, UploadService, UserService } from '../../../core';
import { MetadataService } from '../../../core/services/metadata.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { profileFromErrors, confirmMessages, permissionList, restaurantRoles, OPTIONS } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { validateField } from '../../../shared/validators/form.validator';
import { PasswordValidator } from '../../../shared/validators/password.validator';
import csc from 'country-state-city';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-user-form',
  templateUrl: './restaurant-user-form.component.html',
  styleUrls: ['./restaurant-user-form.component.scss']
})
export class RestaurantUserFormComponent implements OnInit {

  @Input() userData: any = {};
  @Input() isEditable: boolean = false;
  userTypes = restaurantRoles;
  countryList = [];
  cityList = [];
  userForm = new FormGroup({
    id: new FormControl(null),
    picture: new FormControl(),
    role: new FormControl('RESTAURANT_USER', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('971', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    city: new FormControl(''),
    countryName: new FormControl(''),
    countryCode: new FormControl(''),
    location: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    designation: new FormControl('', [Validators.required]),
    permissions: new FormArray([]),
    restaurantId: new FormControl('', [Validators.required]),
    staffPin: new FormControl(''),

  });
  errorMessages = profileFromErrors;
  loading = false;

  permissionArray = this.userForm.get('permissions') as FormArray;

  displayMessage: string = null;
  passwordType = 'password';
  showEye: boolean = false;
  passwordType2 = 'password';
  showEye2: boolean = false;
  permissionList = [
    { title: '', value: permissionList[0] },
    { title: '', value: permissionList[1] },
    { title: '', value: permissionList[2] },
    { title: '', value: permissionList[3] },
    { title: '', value: permissionList[4] },
  ];
  phoneCodeList = [];
  subscription: Subscription;
  roles: any;
  token: any;

  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private metadataService: MetadataService,
    private spinner: SpinnerService, private toastService: ToastService, private uploadService: UploadService,
    private userService: UserService, private restaurantService: RestaurantService, private fb: FormBuilder,
    public languageService: LanguageService, public translate: TranslateService) {
    this.getSelectedLanguage();
  }
  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      this.translate.use(l);
      for (let i = 0; i < this.permissionList.length; i++) {
        const element = this.permissionList[i];
        this.translate.get(`${element.value}`).subscribe((value) => {
          element.title = value;
        })
      }
    })
  }
  ngOnInit(): void {
    this.userData.pictureCDN = this.userData.picture;
    let restaurantData: any = this.restaurantService.getData();
    this.form.restaurantId.setValue(restaurantData.id);
    this.getCountries();

    this.roles = restaurantRoles.map(x =>({
      displayRole:this.translate.instant('restaurants.'+x.role),
      role:x.role
    }));
  }

  get form() {
    return this.userForm.controls;
  }

  setValidation() {
    if (this.form.role.value === this.userTypes[2].role) {
      if (this.form.id.value === null) {
        this.form.staffPin.setValidators([Validators.required]);
      }
      // this.form.location.clearValidators();
      // this.form.location.updateValueAndValidity();
      // this.form.city.clearValidators();
      // this.form.city.updateValueAndValidity();
      this.form.password.clearValidators();
      this.form.password.updateValueAndValidity();
      this.form.confirmPassword.clearValidators();
      this.form.confirmPassword.updateValueAndValidity();

      this.form.mobileCode.clearValidators();
      this.form.mobileCode.updateValueAndValidity();
      this.form.mobileNumber.clearValidators();
      this.form.mobileNumber.updateValueAndValidity();
    }
    else {
      // this.form.location.setValidators([Validators.required]);
      // this.form.location.updateValueAndValidity();
      // this.form.city.setValidators([Validators.required]);
      // this.form.city.updateValueAndValidity();
      this.form.staffPin.clearValidators();
      this.form.staffPin.updateValueAndValidity();

      this.form.password.setValidators([Validators.required]);
      this.form.password.updateValueAndValidity();
      this.form.confirmPassword.setValidators([Validators.required]);
      this.form.confirmPassword.updateValueAndValidity();

      this.form.mobileCode.setValidators([Validators.required]);
      this.form.mobileCode.updateValueAndValidity();
      this.form.mobileNumber.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(15)]);
      this.form.mobileNumber.updateValueAndValidity();
    }
  }

  setPermission($event, field) {
    if ($event.target.checked) {
      this.permissionArray.push(new FormControl(field))
    }
    else {
      let index = this.permissionArray.value.findIndex(x => x == field)
      this.permissionArray.removeAt(index);
    }
  }

  clearDisplayMessage() {
    this.displayMessage = null;
  }
  toggleEdit() {
    this.isEditable = !this.isEditable;
  }
  customizeRoleText(text): string {
    return text.replace('_', ' ').toLowerCase();
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
   * get countries
   */
  getCountries() {
    this.spinner.start();
    this.metadataService.getCountries().subscribe(result => {
      this.phoneCodeList = result;
      this.countryList = result.slice(0, 2);
      let country = this.countryList.find(c => c.code2l === localStorage.getItem('region'));
      this.form.countryCode.setValue(country.code2l);
      this.form.countryName.setValue(country.name);
      this.setCountry(country.name);
      this.spinner.stop();
      if (this.userData.id) {
        this.userForm.patchValue(this.userData);
        this.userData.permissions.forEach(field => {
          this.permissionArray.push(new FormControl(field))
        })
        this.form.countryName.setValue(this.userData.countryName);
        this.form.password.clearValidators();
        this.form.password.updateValueAndValidity();
        this.form.confirmPassword.clearValidators();
        this.form.confirmPassword.updateValueAndValidity();
        if (this.form.role.value === this.userTypes[2].role) {
          this.form.mobileCode.clearValidators();
          this.form.mobileCode.updateValueAndValidity();
          this.form.mobileNumber.clearValidators();
          this.form.mobileNumber.updateValueAndValidity();
        }
        this.setCountry(this.userData.countryName);
        // this.setValidation();
      }
    }, error => {
      ;
      this.spinner.stop();
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
 * upload images
 * @param event 
 * @param type 
 */
  uploadImage(event) {
    let file = event;
    if (this.uploadService.checkImageType(file)) {
      this.displayMessage = OPTIONS.imageType;
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
      this.form.picture.setValue(obj.data.key);
      this.userData.pictureCDN = obj.cdn;
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
   * APi call to create user
   */
  onSubmit() {
    this.displayMessage = null;
    // if (this.form.role.value === this.userTypes[2].role && this.form.id.value === null) {
    //   this.form.staffPin.setValidators([Validators.required]);
    //   this.form.location.clearValidators();
    //   this.form.location.updateValueAndValidity();
    //   this.form.city.clearValidators();
    //   this.form.city.updateValueAndValidity();
    // }
    // console.log(this.userForm)
    if (this.userForm.invalid) {
      validateField(this.userForm);
      this.loading = false;
      return;
    }
    if (this.form.confirmPassword.value != this.form.password.value) {
      this.displayMessage = 'Password & confirm password didn\'t match';
      this.loading = false;
      return;
    }
    if (this.form.role.value === this.userTypes[2].role) {
      this.form.password.setValue(this.form.staffPin.value);
    }
    this.loading = true;
    if (this.form.id.value === null) {
      this.restaurantService.addRestaurantUser(this.userForm.value).subscribe(data => {
        this.loading = false;
        this.toastService.success(data);
        this.dismissModal();
      }, error => {
        this.loading = false;
        this.displayMessage = error;
        if (this.form.role.value === this.userTypes[2].role) {
          this.form.password.reset('')
        }
      });
    }
    else {
      this.restaurantService.updateRestaurantUser(this.userForm.value).subscribe(data => {
        this.loading = false;
        this.toastService.success(data);
        this.dismissModal();
      }, error => {
        this.loading = false;
        this.displayMessage = error;
      });
    }
  }
  /**
  * open modal to confirm status change
  */
  openConfirmStatusChange() {
    let text = this.userData.status == 'active' ? 'block' : 'un-block'
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this user ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.changeStatus();
    })
  }
  /**
   * change status of user
   */
  changeStatus() {
    this.spinner.start();
    this.userService.changeStatus(this.userData.id).subscribe(result => {
      this.toastService.success(result);
      this.spinner.stop();
      this.dismissModal();
      this.userService.refreshTable.next(true);
    }, error => {
      ;
      this.spinner.stop();
      this.toastService.error(error);
    })
  }

  /**
  * open modal to confirm delete
  */
  openConfirmDelete() {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description = confirmMessages.deleteDescription + ` this user ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.deleteRequest();
    })
  }
  /**
  * delete user request
  */
  deleteRequest() {
    this.spinner.start();
    this.userService.delete(this.userData.id).subscribe(result => {
      this.toastService.success(result.message);
      this.spinner.stop();
      this.dismissModal();
      this.userService.refreshTable.next(true);
    }, error => {
      ;
      this.toastService.error(error);
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
    this.activeModal.close('close modal');
  }

}
