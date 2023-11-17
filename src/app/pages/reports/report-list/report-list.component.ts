import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from "angular-datatables";
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportFormComponent } from '../report-form/report-form.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class ReportListComponent implements OnInit {

  dataList = [];
  data = [
    {
      name: 'Pending & Lagging Orders',
      description: 'There are many variations of passages Ipsum available'
    },
    {
      name: 'Trending Orders (Most Ordered)',
      description: 'Embarrassing hidden in the middle of text'
    },
    {
      name: 'Top selling items',
      description: 'There are many variations of passages Ipsum available'
    },
    {
      name: 'Top clients',
      description: 'Embarrassing hidden in the middle of text'
    },
    {
      name: 'Summary of credit lines',
      description: 'There are many variations of passages Ipsum available'
    },
    {
      name: 'Order summary by category',
      description: 'Embarrassing hidden in the middle of text'
    },
  ];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  selectedLang: string;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private toastService: ToastService, public translate: TranslateService, private reportService: ReportService,
    private spinner: SpinnerService, public languageService: LanguageService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = false;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.tableOptions();
    this.selectedLang = localStorage.getItem('language');
  }

  /**
   * table options
   */
  tableOptions() {
    this.dtOptions = {
      searching: false,
      paging: true,
      pagingType: 'full_numbers',
      pageLength: 30,
      ordering: true,
      lengthChange: false,
      order: [],
      columnDefs: [{ orderable: false, targets: 0 }],
      serverSide: true,
      processing: false,
      scrollY: '42vh',
      scrollX: true,
      language: {
        paginate: {
          next: '>', // or '→'
          previous: '<',
          first: '',
          last: '' // or '←'
        }
      },
      columns: [{ data: 'name', orderable: false }, { data: 'description', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['type'] = 'admin';
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        dataTablesParameters['search'] = dataTablesParameters['search'].value;
        this.reportService.getReport(dataTablesParameters).subscribe(result => {
          this.spinner.stop();
          this.dataList = result;
          // this.togglePagination();
          callback({
            recordsTotal: result.length,
            recordsFiltered: 1,
            data: []
          });
        }, error => {
          this.spinner.stop();
        })
      }
    }
  }
  togglePagination() {
    let tabElements = document.getElementsByClassName("dataTables_paginate");
    let tabToDisplay = tabElements.item(0) as HTMLElement;
    if (this.dataList.length === 0) {
      tabToDisplay.style.display = "none";
    }
    else {
      tabToDisplay.style.display = "block";
    }
  }

  /**
   * refresh table
   */
  tableRefresh() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload()
    });
    // console.log('in refresh')
  }

  /**
   * filter data from table
   * @param filterName 
   * @param value 
   */
  tableSetFilter(filterName, value) {
    if (filterName === 'search') {
      this.customFilterData[filterName] = { value, regex: false };
    } else {
      this.customFilterData[filterName] = value;
    }
    this.tableRefresh();
  }

  /**
   * clear the filter
   */
  clearFilter() {
    this.clearing = true;
    setTimeout(() => {
      this.clearing = false;
    }, 200);
    this.customFilterData = {};
    this.tableRefresh();
  }

  /**
   * open modal of restaurant
   */
  open(item) {
    const modalRef = this.modalService.open(ReportFormComponent, { centered: true });
    modalRef.componentInstance.report = item;
  }

}
