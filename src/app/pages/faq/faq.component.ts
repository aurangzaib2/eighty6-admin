import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbAccordion, NgbAccordionConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FaqService } from '../../core/services/faq.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { ToastService } from '../../core/services/toast.service';
import { confirmMessages, faqFormError } from '../../helpers';
import { validateField } from '../../shared/validators/form.validator';
import * as quill from 'ngx-quill' // First matching element will be used
import { AlertModalComponent } from '../../shared';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  providers: [NgbAccordionConfig, NgbModalConfig, NgbModal]
})
export class FaqComponent implements OnInit {

  faqForm = new FormGroup({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required])
  })
  faqForm2 = new FormGroup({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required])
  })
  faqFormArray = new FormArray([]);
  dataList = [];
  loading: boolean = false;
  submitted: boolean = false;
  displayMessage: string = null;
  errorMessages = faqFormError;
  modules = {}
  canAddNew: boolean = false;
  isEditable: boolean = false;
  language:string;
  subscription:Subscription;
  active:number = 1;
  tab_name_1 :string;
  tab_name_2:string;
  setDirection:boolean = false;
  @ViewChild('acc', { static: false }) accordion: NgbAccordion;
  @ViewChild("nav")
  nav;

  newAddedIndex: number;

  constructor(private spinner: SpinnerService, configModal: NgbModalConfig, private faqService: FaqService, private toastService: ToastService,
    config: NgbAccordionConfig, private fb: FormBuilder, private modalService: NgbModal , public translate: TranslateService,
    private languageService : LanguageService) {
    this.modules = {
      'toolbar': [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ]
    }
    config.closeOthers = true;
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.getFaqs();
    this.getSelectedLanguage();
  }
  get form() {
    return this.faqForm.controls;
  }

  get form2(){
    return this.faqForm2.controls;
  }

  toggleEdit() {
    this.isEditable = !this.isEditable;
    if (this.accordion.activeIds.length > 0) {
      let index = this.accordion.activeIds[0].slice(-1)
      this.expandOne(index);
    }
  }
  toggleNew() {
    this.canAddNew = !this.canAddNew;
    if (!this.canAddNew) {
      // this.removeElementAt(this.newAddedIndex);
      this.faqForm.reset();
      this.faqForm2.reset();
      if(this.active == 2){
        this.nav.select(1);
        this.setDirection = !this.setDirection
      }
    }
    // else {
    //   this.newAddedIndex = this.dataList.length + 1;
    //   this.faqFormArray.push(this.fb.group({
    //     question: new FormControl('dddsdsdccfd', [Validators.required]),
    //     answer: new FormControl('', [Validators.required])
    //   }));
    //   console.log(`active${this.newAddedIndex - 1}`)
    //   this.accordion.toggle(`active${this.newAddedIndex - 1}`);
    //   console.log(this.accordion)
    //   // this.expandOne(this.newAddedIndex - 1);
    // }
  }
  removeElementAt(index) {
    this.faqFormArray.removeAt(index)
  }
  expandOne(id) {
    if (this.isEditable) {
      if (this.accordion.isExpanded(`active${id}`)) {
        for (let i = 0; i < this.dataList.length; i++) {
          if (i != id) {
            document.getElementById(`active${i}-header`).style.display = 'block'
          }
          else {
            document.getElementById(`active${id}-header`).style.display = 'none'
          }
        }
      }
      else {
        document.getElementById(`active${id}-header`).style.display = 'block'
      }
    }
  }
  /**
   * get all the faq's
   */
  getFaqs() {
    this.spinner.start();
    this.faqService.getAllFaqs({}).subscribe(result => {
      this.dataList = result.data;
      this.faqFormArray.reset();
      this.faqFormArray.clear();
      this.accordion.closeOtherPanels = true;
      this.isEditable = false;
      this.loading = false;
      this.canAddNew = false;
      this.faqForm.reset();
      this.dataList.forEach(element => {
        this.faqFormArray.push(this.fb.group({
          id: new FormControl(element.id),
          question: new FormControl(element.question, [Validators.required]),
          answer: new FormControl(element.answer, [Validators.required]),
          status: new FormControl(element.status)
        }));
      })
      this.spinner.stop();
    })
  }
  /**
   * save & update
   * @returns 
   */
  onSubmit() {
    this.loading = true;
    this.submitted = true;
    console.log(this.faqForm2.value,"2",this.faqForm.value,"1");
    if (this.faqForm.invalid && this.canAddNew && this.faqForm2.invalid) {
      validateField(this.faqForm);
      validateField(this.faqForm2);
     // console.log(this.faqForm2);
      this.loading = false;
      return;
    }
    if (this.faqFormArray.length === 0) {
      this.addFaq();
      let index = this.accordion.activeIds[0].slice(-1)
      document.getElementById(`active${index}-header`).style.display = 'block'
      this.accordion.closeOtherPanels = true;
      this.isEditable = false;
      this.loading = false;
      this.canAddNew = false;
    }
    else {
      this.updateFaq();
    }
  }
  /**
   * add new faq
   * @returns 
   */
  addFaq() {
    this.faqService.addFaqs(this.faqForm.value).subscribe(result => {
      this.loading = false;
      this.submitted = true;
      this.isEditable = false;
      this.toastService.success('FAQ created successfully');
      this.getFaqs();
    }, error => {
      this.loading = false;
      this.toastService.error(error);
    })
  }
  removeHTML(str) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }
  /**
  * update new faq
  * @returns 
  */
  updateFaq() {
    if (this.canAddNew) {
      this.faqFormArray.push(this.faqForm);
    }
    let promiseArray = [];
    this.faqFormArray.value.forEach((element, index) => {
      this.loading = true;
      if (element.id) {
        this.faqService.updateFaqs(element).subscribe(result => {
          this.toastService.success('FAQ updated successfully');
          promiseArray.push(result);
        }, error => {
          this.loading = false;
          this.toastService.error(error);
        })
      }
      else {
        this.addFaq();
      }
      if (index === this.faqFormArray.value.length - 1) {
        if (this.accordion.activeIds.length > 0) {
          let index = this.accordion.activeIds[0].slice(-1)
          document.getElementById(`active${index}-header`).style.display = 'block'
          this.accordion.closeOtherPanels = true;
        }
        this.isEditable = false;
        this.loading = false;
        this.canAddNew = false;
        this.faqForm.reset();
      }
    });
  }

  /**
* open modal to confirm delete
*/
  openConfirmDelete(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle') +` `+this.translate.instant('sidebar.faq');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('sidebar.faq')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.deleteRequest(item);
    })
  }

  /**
  * hide category request
  * @param item 
  */
  deleteRequest(item) {
    this.spinner.start();
    this.faqService.deleteFaqs(item).subscribe(result => {
      this.toastService.success(result.message);
      this.getFaqs();
    }, error => {
      ;
      this.spinner.stop();
      this.toastService.error(error);
    })
  }

  getSelectedLanguage(){
    this.subscription = this.languageService.updatedLang$.subscribe((l) =>{
      if(this.active == 2){
        this.nav.select(1);
      }
      if(l == 'ar'){
        this.tab_name_1 = "ar";
        this.tab_name_2 = "en";
        this.setDirection = true;
      }
      if(l == 'en'){
        this.tab_name_1 = "en";
        this.tab_name_2 = "ar";
        this.setDirection = false;
      }
    })
  }

  selectTab1(){
    this.setDirection = !this.setDirection
  }

  selectTab2(){
    this.selectLanguage();
  }

  selectLanguage(){
    this.language = localStorage.getItem("language");
    if(this.language == 'ar'){
      this.setDirection = false;
      this.translate.getTranslation('en').subscribe((value)=>{
        //console.log(value);
      })
    }else if(this.language == 'en'){
      this.setDirection = true;
      this.translate.getTranslation('ar').subscribe((value)=>{
        //console.log(value);
      })
    }
  }
}
