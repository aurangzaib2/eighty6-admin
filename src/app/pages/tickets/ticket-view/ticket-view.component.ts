import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService, User, UserService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { TicketsService } from '../../../core/services/tickets.service';
import { ToastService } from '../../../core/services/toast.service';
import { saveAs } from 'file-saver';
import { onBoardingRoles, OPTIONS, ticketStatus } from '../../../helpers';
@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {

  errorMessages;
  loading: boolean = false;
  displayMessage: string = null;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  submitted: boolean = false;
  ticketData: any = {};
  ticketId: string;
  user: any = {};
  currentUser: any;
  commentMessagesList: Array<any> = [];
  comments: Array<any> = [];
  setTimeOut: any;
  comment: string;
  commentMedia: Array<any> = [];
  ticketStatus = [
    {
      key: this.translate.instant('tickets.open'),
      value: ticketStatus.OPEN,
      icon: 'assets/icons/status-dispatched.svg'
    },
    {
      key: this.translate.instant('tickets.inprogress'),
      value: ticketStatus.IN_PROGRESS,
      icon: 'assets/icons/status-pending.svg'
    },
    {
      key: this.translate.instant('tickets.closed'),
      value: ticketStatus.CLOSED,
      icon: 'assets/icons/status-paid.svg'
    }
  ];
  activeStatus: { key: string, icon: string, value: string };
  token: any;
  constructor(private modalService: NgbModal, private router: Router,
    private spinner: SpinnerService, private ticketService: TicketsService, private toastService: ToastService,
    private uploadService: UploadService, private route: ActivatedRoute, private userService: UserService, public translate: TranslateService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.ticketId = params['id'];
        this.getTicketDetails();
        this.userService.currentUser.subscribe((data) => {
          this.currentUser = data;
        });
      }
    })
  }
  ngOnDestroy() {
    clearInterval(this.setTimeOut)
  }
  /**
  * customize the role text
  * @param text 
  * @returns 
  */
  customizeRoleText(text): string {
    if (onBoardingRoles[0].role === text) {
      return this.translate.instant('onBoarding.company');
    }
    else if (onBoardingRoles[1].role === text) {
      return this.translate.instant('onBoarding.restaurant');
    }
    else if (onBoardingRoles[2].role === text){
      return this.translate.instant('onBoarding.supplier');
    }
    return text.replaceAll('_', ' ').toLowerCase();
  }
  /**
   * add class
   */
  checkClass(status) {
    if (status === ticketStatus.CLOSED) {
      return 'green-badge';
    }
    else if (status === ticketStatus.IN_PROGRESS) {
      return 'orange-badge';
    }
    else {
      return 'blue-badge';
    }
  }

  /**
   * check file type to vie image
   */
  checkFileType(media, file) {
    if (file === 'image') {
      if (media.fileType === 'image/png' || media.fileType === 'image/jpg' || media.fileType === 'image/svg' || media.fileType === 'image/jpeg' || media.fileType === 'image/gif') {
        return true;
      }
      return false;
    }
    else {
      if (media.fileType != 'image/png' && media.fileType != 'image/jpg' && media.fileType != 'image/svg' && media.fileType != 'image/jpeg' && media.fileType != 'image/gif') {
        return true;
      }
      return false;
    }
  }
  getTicketDetails() {
    this.ticketService.getTicket(this.ticketId).subscribe((data: any) => {
      this.ticketData = data;
      this.ticketData.isMe = this.ticketData.createdBy.id.toString() === this.currentUser.id.toString()
      this.activeStatus = this.ticketStatus.find(x => x.value === this.ticketData.status);
      this.ticketService.getTicketCommentList(this.ticketId).subscribe((commentArray) => {
        for (let i = 0; i < commentArray.length; i++) {
          let comment = commentArray[i];
          let date = new Date(comment.createdAt);
          this.comments.push({
            id: comment.id,
            comment: comment.comment,
            createdBy: comment.createdBy,
            createdAt: date.getTime(),
            media: comment.media,
            isMe: comment.createdBy.id.toString() === this.currentUser.id.toString()
          })
        }
        this.startTimer();
        this.spinner.stop();
      })
    })
  }

  startTimer() {
    this.setTimeOut = setInterval(async () => {
      this.ticketService.getTicketCommentList(this.ticketId).subscribe((commentArray) => {
        for (let i = 0; i < commentArray.length; i++) {
          if (this.comments.findIndex(x => x.id === commentArray[i].id) === -1) {
            let comment = commentArray[i];
            let date = new Date(comment.createdAt);
            this.comments.push({
              id: comment.id,
              comment: comment.comment,
              createdBy: comment.createdBy,
              createdAt: date.getTime(),
              media: comment.media,
              isMe: comment.createdBy.id.toString() === this.currentUser.id.toString()
            })
          }
        }
      })
    }, 2000)
  }
  uploadAttachment(event) {
    this.commentMedia = [];
    this.fileUploaded = false;
    let file = event.target.files[0];
    file.url = event.target.value;
    if (this.uploadService.checkDocumentType(file)) {
      this.toastService.error(OPTIONS.documentType);
      return;
    }
    if (this.uploadService.checkFileSize(file)) {
      this.toastService.error(OPTIONS.sizeLimit);
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
      this.commentMedia.push({
        fileOriginalName: obj.data.originalname,
        fileSize: (obj.data.size / 1024).toFixed(0),
        file: obj.data.key,
        fileType: file.type
      })
      this.sendMessage();
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

  sendMessage() {
    let whiteSpace = (this.comment || '').trim().length === 0;
    if (whiteSpace && this.commentMedia.length == 0) {
      return this.toastService.error("Comment is required")
    }
    let mediaArr = this.commentMedia != [] && this.commentMedia.length > 0 ? this.commentMedia : [];
    this.spinner.start();
    let commentObject = {
      comment: this.comment == '' || undefined || '' || whiteSpace ? "media" : this.comment,
      ticketId: this.ticketId,
      ticketMedia: mediaArr
    }
    this.ticketService.addCommentForTicket(commentObject).subscribe((data) => {
      if (data) {
        this.comment = null;
        this.commentMedia = [];
        this.fileUploaded = false;
        this.spinner.stop();
      }
    })
  }

  downloadFile(data) {
    if (data[0].file) {
      saveAs(data[0].file, data[0].fileName, { autoBom: true });
    }
  }


  clearAttachment() {
    this.commentMedia = [];
    this.fileUploaded = false;
  }

  changeStatus(status) {
    this.spinner.start()
    let statusObj = {
      status: status
    }
    this.ticketService.changeTicketStatus(this.ticketId, statusObj).subscribe((data) => {
      this.spinner.stop();
      this.getTicketDetails();
      this.toastService.success(data.message)
    })
  }
}
