import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UploadService, UserService } from '../../../core';
import { MarketingService } from '../../../core/services/marketing.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { marketingErrors, OPTIONS } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-marketing-ad-form',
  templateUrl: './marketing-ad-form.component.html',
  styleUrls: ['./marketing-ad-form.component.scss']
})
export class MarketingAdFormComponent implements OnInit {

  @Input() promotionData: any = { id: null };
  type: string = 'new';
  promotionForm = new FormGroup({
    id: new FormControl(null),
    supplierId: new FormControl(''),
    subject: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.maxLength(1500)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    imageWeb: new FormControl('', [Validators.required])
  });
  loading: boolean = false;
  submitted: boolean = false;
  displayMessage: string = null;
  errorMessages = marketingErrors;
  minDate = null;
  activeTab = 1;
  fileInfo;
  fileUploaded: boolean = false;
  allSuppliers: any;
  fileUploadedWeb: boolean = false;
  token: any;
  selectedLang: string;
  constructor(public modalService: NgbModal, private marketingService: MarketingService, private activeModal: NgbActiveModal,
    private toastService: ToastService, private spinner: SpinnerService, private uploadService: UploadService, private calendar: NgbCalendar,
    private userService: UserService, public translate: TranslateService) {
    this.minDate = calendar.getToday();
  }


  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    if (this.promotionData.id != null) {
      this.promotionForm.patchValue(this.promotionData);
      this.form.startDate.setValue(this.setDisplayDate(this.promotionData.startDate));
      this.form.endDate.setValue(this.setDisplayDate(this.promotionData.endDate));
      this.fileUploaded = this.promotionData.image === null || this.promotionData.image === '' ? false : true;
      this.fileUploadedWeb = this.promotionData.imageWeb === null || this.promotionData.imageWeb === '' ? false : true;
      if (this.type === 'view') {
        this.promotionForm.disable();
      }
    }
    this.getSuppliers();
  }
  getSuppliers() {
    this.marketingService.getAllSuppliers().subscribe(data => {
      this.allSuppliers = data;
    });
  }

  get form() {
    return this.promotionForm.controls;
  }
  enableForm() {
    this.type = 'edit';
    this.promotionForm.enable();
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
  supplierChange(sup){
    this.promotionForm.controls.supplierId.setValue(sup.id);
    this.promotionForm.controls.description.setValue(sup.name);
  }
  /**
 * add a new promotion
 * @returns 
 */
  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.displayMessage = null;
    if (!this.promotionForm.valid) {
      validateField(this.promotionForm);
      this.loading = false;
      return;
    }
    let payload = {
      supplierId: this.form.supplierId.value,
      subject: this.form.subject.value,
      startDate: this.setDate(this.form.startDate.value),
      endDate: this.setDate(this.form.endDate.value),
      description: this.form.description.value,
      image: this.form.image.value,
      imageWeb: this.form.imageWeb.value,
      
    }
    this.marketingService.createPromotion(payload).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      ;
      this.displayMessage = error;
    })
  }
  /**
   * update thr promotion
   * @returns 
   */
  update() {
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
      imageWeb: this.form.imageWeb.value
    }
    this.marketingService.updatePromotion(payload).subscribe(result => {
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
   * close modal
   */
  closeModal() {
    this.activeModal.close('close modal')
  }
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event,device) {
    this.prepareFilesList($event,device);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files,device) {
    this.prepareFilesList(files,device);
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
  prepareFilesList(files: Array<any>,device) {
    let file = files[0];
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
        for (const item of files) {
          item.progress = 0;
          this.files.push(item);
          this.uploadImage(files[0],device);
        }
        this.fileDropEl.nativeElement.value = "";
        this.uploadFilesSimulator(0);
      }
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    });

  }
}
