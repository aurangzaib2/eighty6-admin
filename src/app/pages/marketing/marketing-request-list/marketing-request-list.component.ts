import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { UserService } from '../../../core';
import { MarketingService } from '../../../core/services/marketing.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { MarketingRequestFormComponent } from '../marketing-request-form/marketing-request-form.component';

@Component({
  selector: 'app-marketing-request-list',
  templateUrl: './marketing-request-list.component.html',
  styleUrls: ['./marketing-request-list.component.scss']
})
export class MarketingRequestListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { status: [] };

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private marketingService: MarketingService, private toastService: ToastService,
    private spinner: SpinnerService, private userService: UserService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
    this.userService.refreshTable.subscribe((data) => {
      this.tableRefresh();
    })
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
      { data: 'description', orderable: false }, { data: 'supplierName', orderable: true }, { data: 'startDate', orderable: true },
      { data: 'endDate', orderable: true }, { data: null, orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['status'] = this.activeFilters.status;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.marketingService.geAllRequestedPromotionList(dataTablesParameters).subscribe(result => {
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
  * open modal to edit promotion
  */
  openEdit(item) {
    const modalRef = this.modalService.open(MarketingRequestFormComponent, { centered: true });
    modalRef.componentInstance.promotionData = item;
    modalRef.componentInstance.type = 'view';
    modalRef.result.then((result) => {

    }, (dismiss) => {
      this.tableRefresh();
    })
  }
  /**
 * open confirm
 */
  openConfirmApproved(item) {
    let text = 'approve';
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this promotion request ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    // modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.updateStatues(item);
    })
  }
  updateStatues(item) {
    this.spinner.start();
    this.marketingService.updateRequestPromotionAcceptReject(item).subscribe(
      data => {
        this.toastService.success(data.message);
        this.tableRefresh();
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }
  /**
  * open modal to confirm delete
  */
  openReject(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Reject' + 'Promotion';
    modalRef.componentInstance.description = confirmMessages.hideDescription + ' reject this promotion ?';
    modalRef.componentInstance.okText = 'Yes';
    modalRef.componentInstance.cancelText = 'No';
    modalRef.result.then((result) => {
    }, (dismiss) => {

    })
  }

  /**
   * delete promotion
   * @param item 
   */
  openConfirm(item) {

  }

}
