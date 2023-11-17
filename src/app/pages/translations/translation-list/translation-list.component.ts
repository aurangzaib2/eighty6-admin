import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../core';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
  selector: 'app-translation-list',
  templateUrl: './translation-list.component.html',
  styleUrls: ['./translation-list.component.scss']
})
export class TranslationListComponent implements OnInit {
  dataList = [];
  searchText = "";
  selectedField = 'keys';
  page = 1;
  pagelength: number;
  pagesize = 30;
  translatedValues: any = {};
  disable: boolean = false;
  selectedLanguage: any;
  constructor(public translate: TranslateService, private translationService: TranslationService, private modalService: NgbModal,
    private toasterService: ToastService,private spinner: SpinnerService) { }

  ngOnInit(): void {
    this.disable = true
  }

  /* setting language */
  setLanguage(l) {
    if(l !== "") {
       this.selectedLanguage = l ;
       this.disable = false;
    }
    else
    {
      this.selectedLanguage = "";
  }
    this.getTranslationFile();
  }

  /* get the translation files */
  getTranslationFile() {
    if (this.selectedLanguage) {
      this.spinner.start();
      this.translationService.getTranslationFile(this.selectedLanguage).subscribe(value => {
        this.spinner.stop();
        let arr = [];
        for (var key in value) {
          if (value[key] == "") {
            delete value[key]
          }
          arr.push({
            "key": key,
            "value": value[key]
          })
        }
        this.dataList = arr;
        this.pagelength = arr.length;
        //console.log(arr)
      }, error => {
        this.spinner.stop();
        console.log(error);
      })
    }else{
      this.dataList = [];
      this.disable = true;
    }
  }

  /* sorting values and keys */
  setFieldName(key) {
    if (this.selectedField === key) {
      this.selectedField = '-' + this.selectedField;
    } else {
      this.selectedField = key;
    }
  }


  /**
 * open modal to confirm status change
 */
  openConfirmStatusChange(data) {
    // let text = item.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block')
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.update');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.updateDescription') + ` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.checkButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {
      var object = data.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});
      // console.log(object)

      let translationData = {
        langCode: this.selectedLanguage,
        content: object
      }

      this.spinner.start();
      this.translationService.saveTranslationFile(translationData).subscribe(value => {
        this.spinner.stop();
        this.toasterService.success(value);
      }, error => {
        this.spinner.stop();
        console.log(error);
      })
    })
  }

  /* set validation */
  setValidation(e) {
    (e == undefined || e == "") ? this.disable = true : this.disable = false;
  }

}
