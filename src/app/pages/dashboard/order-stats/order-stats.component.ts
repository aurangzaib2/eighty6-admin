import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { SpinnerService } from '../../../core/services/spinner.service';
import { monthsName } from '../../../helpers';
import { MetadataService } from '../../../core/services/metadata.service';
import { ChartType, ChartOptions, ChartDataSets, Chart } from 'chart.js';
import { Label, Color, BaseChartDirective } from 'ng2-charts';
import { NgbDatepickerNavigateEvent, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TransactionsService } from '../../../core/services/transactions.service';
import { TranslateService } from '@ngx-translate/core';

Chart.defaults.global.legend.display = false;


@Component({
  selector: 'app-order-stats',
  templateUrl: './order-stats.component.html',
  styleUrls: ['./order-stats.component.scss']
})
export class OrderStatsComponent implements OnInit, AfterViewInit {

  statsData = {
    totalAmount: 0,
    rejectedOrder: 0,
    percentage: 0,
    transactions: '0 transactions',
  };
  dataList = [];
  months = monthsName;
  currentMonth = {
    name: moment().format('MMMM'),
    number: moment().format('M'),
  };
  selectMonth;

  datePickerConfig = {
    format: 'MMM, YYYY',
    closeOnSelect: 'close',
    openOnClick: 'yes',
    showGoToCurrent: 'enable',
    monthBtnFormat: 'MMM'
  }
  public lineChartData: ChartDataSets[] = [
    { data: [9, 10, 20, 91] },
  ];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      xAxes: [
        {
          display: false
        }
      ],
      yAxes: [
        {
          display: false
        }
      ]
    }
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(253,215,66,255)',
      borderColor: 'rgb(244,113,33)',
      pointBackgroundColor: 'rgba(255,255,255,255)',
      pointBorderColor: 'rgba(248,170,67,255)',
      pointHoverBackgroundColor: 'rgba(248,170,67,255)',
      pointHoverBorderColor: 'rgba(255,255,255,255)',
      pointBorderWidth: 3,
      pointHoverBorderWidth: 3,
      pointRadius: 5,
      borderWidth: 4
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  @ViewChild('transaction', { static: true }) transaction: NgbTooltip;
  public lineChartLabels: Label[] = ['March', 'April', 'May', 'June'];
  currency = localStorage.getItem('currency')
  selectedLang: string;
  constructor(private metaData: MetadataService, private spinner: SpinnerService, private transactionsService: TransactionsService, public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.selectMonth = moment().format('MMM, YYYY');
    this.getData();
    this.getTransactions();
    this.selectedLang = localStorage.getItem('language');

  }

  ngAfterViewInit() {
    this.transaction.open()
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.transaction.open()
  }
  @HostListener("contextmenu", ["$event"])
  onRightClick(event) {
    this.transaction.open();
  }

  /**
   * get stats data
   */
  getData() {
    let obj = {
      selectMonth: moment().month((this.selectMonth).split(', ')[0]).format('M'),
      currentMonth: this.currentMonth.number,
      // monthName: this.months.slice(this.currentMonth.number,3),
      year: (this.selectMonth).split(', ')[1]
    };
    this.spinner.start();
    this.metaData.getStatics(obj).subscribe(data => {
      this.statsData = data;
      this.statsData.percentage = data.rejectedOrder > 0 ? (data.rejectedOrder / data.totalOrderCount) * 100 : 0;
      this.lineChartData = [
        { data: data.countDays }
      ];
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getTransactions() {
    let obj = {
      limit: 10
    }
    this.transactionsService.getAllTransactions(obj).subscribe(result => {
      this.spinner.stop();
      this.dataList = result.data;
    }, error => {
      ;
      this.spinner.stop();
    })
  }
}
