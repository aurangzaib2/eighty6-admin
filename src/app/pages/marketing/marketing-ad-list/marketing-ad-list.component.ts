import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { MarketingService } from '../../../core/services/marketing.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { MarketingAdFormComponent } from '../marketing-ad-form/marketing-ad-form.component';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';

@Component({
  selector: 'app-marketing-ad-list',
  templateUrl: './marketing-ad-list.component.html',
  styleUrls: ['./marketing-ad-list.component.scss']
})
export class MarketingAdListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private marketingService: MarketingService, private toastService: ToastService,
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
      columns: [{ data: 'subject', orderable: false },
      { data: 'description', orderable: false }, { data: 'startDate', orderable: true },
      { data: 'endDate', orderable: true }, { data: null, orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.marketingService.getAllPromotions(dataTablesParameters).subscribe(result => {
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
  * open modal to edit promotion
  */
  openEdit(item, type) {
    const modalRef = this.modalService.open(MarketingAdFormComponent, { centered: true });
    modalRef.componentInstance.promotionData = item;
    modalRef.componentInstance.type = type;
    modalRef.result.then((result) => {

    }, (dismiss) => {
      this.tableRefresh();
    })
  }

  /**
* open modal to confirm delete
*/
  openConfirm(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = this.translate.instant('confirmMessages.deleteTitle') +` `+this.translate.instant('confirmMessages.promotion');
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.promotion')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.yes');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.no');
    modalRef.result.then((result) => {
      // console.log(result)
    }, (dismiss) => {
      // ;
      this.deletRequest(item);
    })
  }
  /**
   * delete promotion
   * @param item 
   */
  deletRequest(item) {
    this.marketingService.deletePromotion(item).subscribe(result => {
      // console.log('delete request', result);
      this.toastService.success(result.message);
      this.tableRefresh();
    }, error => {
      // ;
      this.toastService.error(error);
    })
  }
}
