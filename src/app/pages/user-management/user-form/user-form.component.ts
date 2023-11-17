import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MetadataService } from '../../../core/services/metadata.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import csc from 'country-state-city';
import { confirmMessages, OPTIONS, profileFromErrors, userRoles } from '../../../helpers';
import { PasswordValidator } from '../../../shared/validators/password.validator';
import { UploadService, UserService } from '../../../core';
import { validateField } from '../../../shared/validators/form.validator';
import { AlertModalComponent } from '../../../shared';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  @Input() userData: any = {};
  @Input() isEditable: boolean = false;
  userTypes = userRoles;
  countryList = [];
  cityList = [];
  userForm = new FormGroup({
    id: new FormControl(null),
    profilePicture: new FormControl(),
    role: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    mobileCode: new FormControl('971', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required, Validators.maxLength(15), Validators.minLength(8)]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    countryCode: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    region: new FormControl(''),
  });
  errorMessages = profileFromErrors;
  loading = false;

  displayMessage: string = null;
  passwordType = 'password';
  showEye: boolean = false;
  passwordType2 = 'password';
  showEye2: boolean = false;
  profilePicture: string = null;
  token: any;
  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private metadataService: MetadataService,
    private spinner: SpinnerService, private toastService: ToastService, private uploadService: UploadService,
    private userService: UserService, public translate: TranslateService) { }

  ngOnInit(): void {
    if (this.userData.id) {
      this.profilePicture = this.userData.profilePicture;
      this.userForm.patchValue(this.userData);
      this.form.country.setValue(this.userData.countryName);
      this.form.password.clearValidators();
      this.form.password.updateValueAndValidity();
      this.form.confirmPassword.clearValidators();
      this.form.confirmPassword.updateValueAndValidity();
    }
    this.getCountries();
  }

  get form() {
    return this.userForm.controls;
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
      this.countryList = result;
      if (this.userData.id) {
        this.setCountry(this.userData.countryName);
      }
      this.spinner.stop();
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

      this.userForm.controls.region.setValue(country?.code2l);
   
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
      this.form.profilePicture.setValue(obj.data.key);
      this.profilePicture = obj.cdn;
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
    console.log(this.userForm.controls)
    if (this.userForm.invalid) {
      validateField(this.userForm);
      return;
    }
    if (this.form.password.value && this.form.confirmPassword.value != this.form.password.value) {
      this.form.password.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.confirmPassword.setValidators([Validators.required]);
      this.form.password.updateValueAndValidity();
      this.form.confirmPassword.updateValueAndValidity();
      this.displayMessage = 'Password & confirm password didn\'t match';
      return;
    }
    this.loading = true;
    if (this.form.id.value === null) {
      this.userService.addUser(this.userForm.value).subscribe(data => {
        this.loading = false;
        this.toastService.success(data);
        this.dismissModal();
      }, error => {
        this.loading = false;
        this.displayMessage = error;
      });
    }
    else {
      this.userService.update(this.userData.id, this.userForm.value).subscribe(data => {
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
    // let text = this.userData.status == 'active' ? 'block' : 'un-block'
    let text = this.userData.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block')
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + ` ${text}` + ` `+this.translate.instant('confirmMessages.thisUser')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
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
    // modalRef.componentInstance.description = confirmMessages.deleteDescription + ` this user ?`;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.thisUser')+` ?`; 
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
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
