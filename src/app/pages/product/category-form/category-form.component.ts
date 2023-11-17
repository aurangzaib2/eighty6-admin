import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { categoryFormErrors, OPTIONS } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  @Input() data: any = {};
  categoryForm = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    arabicName: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    parentId: new FormControl(null),
    image: new FormControl(''),
  });
  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = categoryFormErrors;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  token: any;
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private productService: ProductService,
    private uploadService: UploadService, private toastService: ToastService, private spinner: SpinnerService, public translate: TranslateService) { }

  get form() {
    return this.categoryForm.controls;
  }
  ngOnInit(): void {
    if (this.data.id) {
      this.categoryForm.patchValue(this.data);
      this.categoryForm.controls.arabicName.setValue(this.data.nameTranslation.ar)
      this.fileInfo.image = this.data.image
      this.fileUploaded = this.fileInfo.image ? true : false;
    }
  }

  uploadImage(event) {
    this.displayMessage = null;
    let file = event;
    const Img = new Image();
    Img.src = URL.createObjectURL(file);

    Img.onload = (e: any) => {
      const height = e.path[0].height;
      const width = e.path[0].width;
      if (this.uploadService.checkHeightWidth(width, height)) {
        this.displayMessage = OPTIONS.dimension;
        return;
      }
    }
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
      this.form.image.setValue(obj.data.key);
      this.fileInfo = obj.data;
      this.fileInfo.image = obj.cdn;
      this.fileInfo.originalSize = (this.fileInfo.size / 1024).toFixed(0)
      this.fileUploaded = true;
      this.displayMessage = null;
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
  clearImage() {
    this.fileUploaded = false;
    this.form.image.setValue('');
  }
  /**
   * add new category
   * @returns 
   */
  onSubmit() {
    this.loading = true;
    if (this.categoryForm.invalid) {
      validateField(this.categoryForm);
      this.loading = false;
      return;
    }
    let nameTranslation = {
      en: this.categoryForm.value.name,
      ar: this.categoryForm.value.arabicName,
    }
    this.categoryForm.removeControl('arabicName');
    let data = this.categoryForm.value;
    data.nameTranslation = nameTranslation;
    this.productService.addCategory(data).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
  /**
   * update the category
   * @returns 
   */
  update() {
    this.loading = true;
    if (this.categoryForm.invalid) {
      validateField(this.categoryForm);
      this.loading = false;
      return;
    }
    let nameTranslation = {
      en: this.categoryForm.value.name,
      ar: this.categoryForm.value.arabicName,
    }
    this.categoryForm.removeControl('arabicName');
    let data = this.categoryForm.value;
    data.nameTranslation = nameTranslation;
    this.productService.updateCategory(this.categoryForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }

  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
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
      this.uploadImage(files[0]);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }
}
