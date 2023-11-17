import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbActiveModal, NgbNavConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../core';
import { MetadataService } from '../../../core/services/metadata.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { OPTIONS } from '../../../helpers';
import { saveAs } from "file-saver";

@Component({
  selector: 'app-special-price-form',
  templateUrl: './special-price-form.component.html',
  styleUrls: ['./special-price-form.component.scss']
})
export class SpecialPriceFormComponent implements OnInit {

  loading: boolean = false;
  fileInfo;
  fileUploaded: boolean = false;
  displayMessage: string = null;
  supplierId: number = null;
  @Input() restaurantId: number;
  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private uploadService: UploadService, private metadataService: MetadataService, config: NgbNavConfig, private toastService: ToastService, private spinner: SpinnerService,
    private changeDetaction: ChangeDetectorRef, private route: ActivatedRoute, public translate: TranslateService, private supplierService: SupplierService) {
    // customize default values of navs used by this component tree
    config.destroyOnHide = false;
    config.roles = false;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.supplierId = params['id'];
    })
  }

  /**
   * upload file
   */
  upload(event) {
    let file = event;
    if (this.uploadService.checkExcel(file)) {
      this.displayMessage = OPTIONS.excelType;
      return;
    }
    this.fileInfo = file;
    this.fileInfo.originalSize = (this.fileInfo.size / 1024).toFixed(0)
    this.fileUploaded = true;
    this.displayMessage = null;
  }
  submit() {
    if (this.fileInfo) {
      this.spinner.start();
      this.displayMessage = null;
      // this.spinner.start();
      let formData = new FormData();
      formData.append('file', this.fileInfo);
      formData.append('supplierId', this.supplierId.toString());
      formData.append('restaurantId', this.restaurantId.toString());
      this.uploadService.bulkUploadMarketList(formData).subscribe((success): any => {
        this.spinner.stop();
        this.toastService.success('Price added successfully');
        this.dismissModal();
      }, error => {
        this.spinner.stop();
        this.displayMessage = (error);
      })
    }
    else {
      this.displayMessage = ('Please upload the file');
    }
  }
  clearImage() {
    this.fileInfo = {};
    this.fileUploaded = false;
    this.displayMessage = null;
  }
  /**
   * download bulk upload template
   */
  downloadTemplate() {
    let payload = {
      supplierId: this.supplierId,
      restaurantId: this.restaurantId
    }
    this.spinner.start();
    this.supplierService.getSupplierProductExcel(payload).subscribe((result) => {
      this.spinner.stop();
      saveAs(result, 'Template.xlsx');
    }, error => {
      this.spinner.stop();
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
      this.upload(item);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }
}
