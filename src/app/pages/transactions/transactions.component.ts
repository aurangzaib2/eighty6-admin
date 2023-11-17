import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { SpinnerService } from '../../core/services/spinner.service';
import { ToastService } from '../../core/services/toast.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { TransactionsReceiptComponent } from './transactions-receipt/transactions-receipt.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { status: [] };
  currency = localStorage.getItem('currency');
  selectedLang: string;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private transactionsService: TransactionsService, private toastService: ToastService,
    private spinner: SpinnerService, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
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
      pageLength: 20,
      ordering: true,
      lengthChange: false,
      order: [],
      columnDefs: [{ orderable: false, targets: 0 }],
      serverSide: true,
      processing: false,
      scrollY: '42vh',
      // scrollX: true,
      language: {
        paginate: {
          next: '>', // or '→'
          previous: '<',
          first: '',
          last: '' // or '←'
        }
      },
      columns: [{ data: 'invoiceId', orderable: false,width:'14%' },
        { data: 'orderId', orderable: false, width: '14%' }, { data: 'restaurantName', orderable: true, width: '18%' },
        { data: 'supplierName', orderable: true, width: '18%' }, { data: 'amount', orderable: false, width: '14%' },
        { data: 'createdAt', orderable: true, width: '10%' },
        { data: 'createdAt', orderable: false, width: '10%'}],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.transactionsService.getAllTransactions(dataTablesParameters).subscribe(result => {
          this.spinner.stop();
          this.dataList = result.data;
          this.togglePagination();
          callback({
            recordsTotal: result.recordsTotal,
            recordsFiltered: result.recordsFiltered,
            data: []
          });
        }, error => {
          ;
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
  setFilter(value, isChecked, type) {
    if (isChecked) {
      if (value !== 'all') {
        this.activeFilters.status.push(value);
      } else {
        this.activeFilters.status = [];
      }
    } else {
      let i = this.activeFilters.status.findIndex(v => v === value);
      this.activeFilters.status.splice(i, 1);
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
   * view the receipt
   * @param item 
   */
  openReceipt(item) {
    const modalRef = this.modalService.open(TransactionsReceiptComponent, { centered: true });
    modalRef.componentInstance.transactionData = item;
  }
}
