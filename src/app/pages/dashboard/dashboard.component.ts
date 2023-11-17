import { Component, ComponentFactoryResolver, ElementRef, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../core/services';
import { DatePipe } from '@angular/common';
import { OrderStatsComponent } from './order-stats/order-stats.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-feedback-reports',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title: string[] = [];
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  selected = false;
  showDiv = false;
  all = false;
  others = null;
  othersValue = null;
  showChart = true;
  @ViewChild('chartContainer', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
  data = null;
  loading = false;
  showNoDataText = false;
  chart: any;

  @ViewChild('orderStats') child: OrderStatsComponent;
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.child.onClick(event);
  }
  @HostListener("contextmenu", ["$event"])
  onRightClick(event) {
    this.child.onRightClick(event);
  }
  constructor(private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private resolver: ComponentFactoryResolver,
    private userService: UserService,
    public datePipe: DatePipe,
    public translate: TranslateService
  ) {
    this.fromDate = null;
    this.toDate = null;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (this.toDate && this.fromDate) {
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }


  ngOnInit() {

  }

  formatDateServerPass() {
    if (!this.toDate || !this.fromDate) {
      return {};
    }
    let toDate = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;
    let fromDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    return { fromDate, toDate };
  }


  renderChat(groupData, index) {
    let data = [];
    let labels = [];
    for (let key in groupData) {
      if (groupData.hasOwnProperty(key)) {
        data.push(groupData[key]);
        if (key.length > 40) {
          labels.push(key);
        } else {
          labels.push(key);
        }
      }
    }
    this.loading = false;
  }
}
