import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UploadService, UserService } from '../../../core';
import { MarketingService } from '../../../core/services/marketing.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages, marketingErrors, OPTIONS } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-marketing-request-form',
  templateUrl: './marketing-request-form.component.html',
  styleUrls: ['./marketing-request-form.component.scss']
})
export class MarketingRequestFormComponent implements OnInit {

  @Input() promotionData: any;
  @Input() type: string = null;
  promotionForm = new FormGroup({
    id: new FormControl(''),
    subject: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.maxLength(1500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    imageWeb: new FormControl('', [Validators.required]),
    supplierId: new FormControl('', [Validators.required]),
  });

  rejectForm = new FormGroup({
    id: new FormControl(''),
    reason: new FormControl('', [Validators.required]),
    status: new FormControl('rejected')
  });

  loading: boolean = false;
  submitted: boolean = false;
  displayMessage: string = null;
  errorMessages = marketingErrors;
  fileInfo;
  fileUploaded: boolean = false;
  minDate = null;
  fileUploadedWeb: boolean;
  token: any;
  constructor(public modalService: NgbModal, private marketingService: MarketingService, private activeModal: NgbActiveModal,
    private toastService: ToastService, private spinner: SpinnerService, private uploadService: UploadService, private calendar: NgbCalendar,
    private userService: UserService, public translate: TranslateService) {
    this.minDate = calendar.getToday();
  }

  ngOnInit(): void {
    if (this.promotionData.id != null) {
      this.promotionForm.patchValue(this.promotionData);
      this.fileUploaded = this.promotionData.image === null || this.promotionData.image === '' ? false : true;
      this.fileUploadedWeb = this.promotionData.imageWeb === null || this.promotionData.imageWeb === '' ? false : true;
      this.form.startDate.setValue(this.setDisplayDate(this.promotionData.startDate));
      this.form.endDate.setValue(this.setDisplayDate(this.promotionData.endDate));
      if (this.type === 'view') {
        this.promotionForm.disable();
      }
    }
  }

  get form() {
    return this.promotionForm.controls;
  }
  get form2() {
    return this.rejectForm.controls;
  }
  enableForm() {
    this.type = 'edit';
    this.promotionForm.enable();
  }
  /**
   * check upload file type
   * @param file 
   * @returns 
   */
  checkFileType(file) {
    if (!file.type.match('image/png') || !file.type.match('image/jpeg')) {
      return true;
    }
    return false
  }
  /**
   * upload image
   * @param event 
   */
  uploadImage(event,device) {
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
          if (device == 'mob') {
            this.form.image.setValue(obj.data.key);
            this.fileInfo = obj.data;
            this.promotionData.image = obj.cdn;
            this.fileUploaded = true;
            this.displayMessage = null;
            this.spinner.stop();
            }else{
            this.form.imageWeb.setValue(obj.data.key);
            this.fileInfo = obj.data;
            this.promotionData.imageWeb = obj.cdn;
            this.fileUploadedWeb = true;
            this.displayMessage = null;
            this.spinner.stop();
            }
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
  clearImage() {
    if (this.promotionForm.enabled) {
      this.fileUploaded = false;
      this.form.image.setValue('');
    }
  }
  clearImageWeb() {
    if (this.promotionForm.enabled) {
      this.fileUploadedWeb = false;
      this.form.imageWeb.setValue('');
    }
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
  /**
   * update thr promotion
   * @returns
   */
  onSubmit() {
    this.loading = true;
    this.displayMessage = null;
    this.submitted = true;
    if (this.form.startDate.value) {
      this.form.startDate.clearValidators();
      this.form.startDate.updateValueAndValidity();
    }
    if (this.form.endDate.value) {
      this.form.endDate.clearValidators();
      this.form.endDate.updateValueAndValidity();
    }
    if (this.promotionForm.invalid) {
      validateField(this.promotionForm);
      this.loading = false;
      return;
    }
    let payload = {
      id: this.form.id.value,
      supplierId: this.form.supplierId.value,
      subject: this.form.subject.value,
      startDate: this.setDate(this.form.startDate.value),
      endDate: this.setDate(this.form.endDate.value),
      description: this.form.description.value,
      image: this.form.image.value,
      imageWeb: this.form.imageWeb.value,
    }
    this.marketingService.updateRequestPromotion(payload).subscribe(result => {
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
   * open confirm
   */
  openConfirmApproved() {
    let text = 'approved';
    this.closeModal();
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this promotion request ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    // modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.updateStatus(this.promotionData);
    })
  }
  openReject() {
    this.type = 'reject';
    this.rejectForm.controls.id.setValue(this.promotionData.id)
  }

  onSubmitReject() {
    this.displayMessage = null;
    this.submitted = true;
    if (this.rejectForm.invalid) {
      validateField(this.rejectForm);
      this.loading = false;
      return;
    }
    this.updateStatus(this.rejectForm.value);
  }

  updateStatus(item) {
    this.spinner.start();
    this.marketingService.updateRequestPromotionAcceptReject(item).subscribe(
      data => {
        this.spinner.stop();
        this.dismissModal();
        this.toastService.success(data.message);
        this.userService.refreshTable.next(true);
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }

  /**
   * close modal
   */
  closeModal() {
    this.activeModal.close('close modal')
  }

  @Output() onFileDropped = new EventEmitter<any>();

  @HostBinding('style.background-color') private background = '#f5fcff'
  @HostBinding('style.opacity') private opacity = '1'


  //Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#9ecbec';
    this.opacity = '0.8'
  }
  //Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff'
    this.opacity = '1'
  }
  //Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt,device) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff'
    this.opacity = '1'
    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileDropped.emit(files);
      this.uploadImage(files[0],device);
    }

  }

}
