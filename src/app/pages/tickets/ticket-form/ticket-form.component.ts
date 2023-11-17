import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../core';
import { ticketFormErrors } from '../../../helpers';
import { SpinnerService } from '../../../core/services/spinner.service';
import { TicketsService } from '../../../core/services/tickets.service';
import { ToastService } from '../../../core/services/toast.service';
import { OPTIONS } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
  providers: [NgbDropdownConfig]
})
export class TicketFormComponent implements OnInit {

  @Input() ticketAttachment: any = {
    image: null
  };

  ticketForm = new FormGroup({
    subject: new FormControl('', [Validators.required,Validators.maxLength(150)]),
    description: new FormControl('', [Validators.required,Validators.maxLength(1000)]),
    // status: new FormControl('Open'),
    // departmentId: new FormControl('', [Validators.required]),
    ticketMedia: new FormGroup({
      fileOriginalName: new FormControl(),
      fileSize: new FormControl(),
      file: new FormControl(),
      fileType: new FormControl()
    })
  });
  ticketTypes: any = [];
  errorMessages = ticketFormErrors;
  loading: boolean = false;
  displayMessage: string = null;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  submitted: boolean = false;
  token: any;
    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private router: Router, config: NgbDropdownConfig,
      private spinner: SpinnerService, private ticketService: TicketsService, private toastService: ToastService,
      private uploadService: UploadService,public translate: TranslateService) {
    // customize default values of drop downs used by this component tree
    config.placement = 'bottom';
    config.autoClose = false;
  }

  ngOnInit(): void {
    // this.getTicketTypes();
  }

  get form() {
    return this.ticketForm.controls;
  }
  

  setSubject(event) {
    let department = this.ticketTypes.find(x => x.id === event);
    this.form.subject.setValue(department.name);
  }

 
  /**
   * upload attachment
   * @param event 
   * @returns 
   */

  uploadAttachment(event) {
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
      this.ticketAttachment.image = obj.cdn;
      this.ticketForm.get('ticketMedia.file').setValue(obj.data.key);
      this.ticketForm.get('ticketMedia.fileOriginalName').setValue(obj.data.originalname);
      this.ticketForm.get('ticketMedia.fileType').setValue(file.type);
      this.ticketForm.get('ticketMedia.fileSize').setValue((obj.data.size / 1024).toFixed(0));
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

  clearAttachment() {
    if (this.ticketForm.enabled) {
      this.fileUploaded = false;
      this.ticketForm.get('ticketMedia.file').setValue('');
      this.ticketForm.get('ticketMedia.fileOriginalName').setValue('');
      this.ticketForm.get('ticketMedia.fileSize').setValue('');
      this.ticketForm.get('ticketMedia.fileType').setValue('');
    }
  }


  /**
   * create a ticket
   * @returns 
   */
  onSubmit() {
    this.loading = true;
    this.displayMessage = null;
    if (this.ticketForm.invalid) {
      validateField(this.ticketForm);
      this.loading = false;
      return;
    }

    let mediaArr = Object.values(this.ticketForm.get('ticketMedia').value).every(x => x === null || x === '' ) ? [] : [this.ticketForm.get('ticketMedia').value]

    let ticketObject = {
      subject:this.ticketForm.get('subject').value,
      description:this.ticketForm.get('description').value,
      ticketMedia: mediaArr
    }
    this.ticketService.addTicket(ticketObject).subscribe(result => {
      console.log(result)
      this.toastService.success('Ticket created successfully');
      this.loading = false;
      this.dismissModal();
    })
  }



  dismissModal() {
    this.modalService.dismissAll('dissmiss modal');
  }

  closeModal() {
    this.activeModal.close('Modal close');
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
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff'
    this.opacity = '1'
    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileDropped.emit(files);
      this.uploadAttachment(files[0]);
    }
  }

}
