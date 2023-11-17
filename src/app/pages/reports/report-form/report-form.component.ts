import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbDate, NgbDateStruct, NgbDropdown, NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  NgbDatepicker,
  NgbInputDatepicker,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { ReportService } from '../../../core/services/report.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { saveAs } from "file-saver";
import { split } from 'lodash';

const now = new Date();
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
  providers: [NgbActiveModal, NgbModal, NgbDropdownConfig]
})
export class ReportFormComponent implements OnInit {

  hoveredDate: NgbDateStruct;
  fromDate: any = moment().format('YYYY-MM-DD');
  toDate: any;
  formatType: string = 'excel';
  private _subscription: Subscription;
  private _selectSubscription: Subscription;
  @ViewChild("d1") input: NgbInputDatepicker;
  @ViewChild("myDrop") myDrop: NgbDropdown;
  @ViewChild('myRangeInput') myRangeInput: ElementRef;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  selectedOption = 'today';
  report: any = {};
  selectedLang: string;
  constructor(public activeModal: NgbModal, private router: Router, config: NgbDropdownConfig,
    element: ElementRef, private renderer: Renderer2, private _parserFormatter: NgbDateParserFormatter,
    private toastService: ToastService, public translate: TranslateService, private reportService: ReportService,
    private spinner: SpinnerService, public languageService: LanguageService) {
    // customize default values of drop downs used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
  }

  ngOnInit(): void {
    this.selectedOption =  this.translate.instant('reports.today');
    this.selectedLang = localStorage.getItem('language');
  }

  dismissModal() {
    this.activeModal.dismissAll();
  }
  onSingleDateSelection(date: NgbDate) {
    let parsed = '';
    this.fromDate = date;
    if((date.day == 30 && date.month != 12) || (date.day == 31 && date.month != 12)){
      var endDate = {
        day : 1,
        month : date.month + 1,
        year : date.year,
      };
    } else if((date.day == 28 && date.month == 2) || (date.day == 29 && date.month == 2)){
      var endDate = {
        day : 1,
        month : date.month + 1,
        year : date.year,
      };
    } else if(date.day == 31 && date.month == 12){
      var endDate = {
        day : 1,
        month : date.month,
        year : date.year + 1,
      };
    }
    else{
      var endDate = {
        day : date.day + 1,
        month : date.month,
        year : date.year,
      };
    }
    this.toDate = endDate;
    if(this.fromDate){
      parsed += this._parserFormatter.format(this.fromDate);
    } 
    if(this.toDate){
      parsed += ' - ' + this._parserFormatter.format(this.toDate);
    }    
    this.selectedOption = parsed;
    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }
  onDateSelection(date: NgbDate) {
    let parsed = '';
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate) {
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate) {
      parsed += ' - ' + this._parserFormatter.format(this.toDate);
      this.selectedOption = parsed;
      this.input.close();
      this.myDrop.close();
    }
    // console.log('select option', this.selectedOption, 'from date :', this.fromDate, '| to date :', this.toDate);
    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }
  /**
   * format date
   * @param date 
   * @returns 
   */
  formatDate(date) {
    if (!date.year) {
      return date;
    }
    return moment(`${date.year}-${date.month}-${date.day}`).format('YYYY-MM-DD');
  }
  selectOption($event) {
    this.selectedOption = $event;
    if (this.selectedOption === 'today') {
      this.selectedOption =  this.translate.instant('reports.today');
      this.fromDate = moment().format('YYYY-MM-DD');
      this.toDate = moment().add(1,"day").format('YYYY-MM-DD');
    }
    else if (this.selectedOption === 'yesterday') {
      this.selectedOption =  this.translate.instant('reports.yesterday');
      this.fromDate = moment().subtract(1, "days").format('YYYY-MM-DD');
      this.toDate = moment().format('YYYY-MM-DD');
    }
    else if (this.selectedOption === 'this month') {
      this.selectedOption =  this.translate.instant('reports.thisMonth');
      this.fromDate = moment().startOf('month').format('YYYY-MM-DD');
      this.toDate = moment().format('YYYY-MM-DD');
    }
    else if (this.selectedOption === 'last month') {
      this.selectedOption =  this.translate.instant('reports.lastMonth');
      this.fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
      this.toDate = moment().date(0).format('YYYY-MM-DD');
    }
    else if (this.selectedOption === 'year to date') {
      this.selectedOption =  this.translate.instant('reports.yearTodate');
      this.fromDate = moment().startOf('years').format('YYYY-MM-DD');
      this.toDate = moment().format('YYYY-MM-DD');
    }
    else if (this.selectedOption === 'last year') {
      this.selectedOption =  this.translate.instant('reports.lastYear');
      this.fromDate = moment().subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      this.toDate = moment().subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
    } 
    this.myDrop.close();
    // console.log('select option', this.selectedOption, 'from date :', this.fromDate, '| to date :', this.toDate);
  }

  /**
 * download
 */
  downloadExcel() {
    let payload = {
      startDate: typeof this.fromDate === 'object' ? this.formatDate(this.fromDate) : this.fromDate,
      formatType: this.formatType
    }
    if (this.toDate) {
      payload['endDate'] = typeof this.toDate === 'object' ? this.formatDate(this.toDate) : this.toDate
    }
    //console.log(payload)
    this.spinner.start();
    this.reportService.downloadReport(payload, this.report.link).subscribe((result) => {
      this.spinner.stop();
      saveAs(result, `${this.report.name}.xlsx`);
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    })
  }

  navigateTo(page) {
    this.dismissModal();
    this.router.navigate([`/restaurant/:id/${page}`])
  }

}
