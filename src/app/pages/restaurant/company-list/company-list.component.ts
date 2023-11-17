import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { RestaurantService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class CompanyListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  page = 1;
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { status: null };
  selectedLang:any
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router, private modalService: NgbModal,
    private spinner: SpinnerService, private restaurantService: RestaurantService, public translate: TranslateService,
    private toastService: ToastService) {
    // customize default values of dropdowns used by this component tree
    // config.placement = 'bottom-right';
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
      pageLength: 20,
      ordering: true,
      lengthChange: false,
      order: [],
      columnDefs: [{ orderable: false, targets: 0, }],
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
      columns: [{ data: 'name', orderable: true,width:'17%' },
        { data: 'Standalone', orderable: false,width: '9%' },
        { data: 'location', orderable: true, width: '14%' }, { data: 'contactPerson', orderable: true, width: '18%' },
      { data: 'email', orderable: true, width: '21%' }, { data: 'mobileNumber', orderable: true, width: '20%' },
      { data: 'restaurantCount', orderable: true,width: '10%' }, { data: 'Action', orderable: false, width: '6%' }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['status'] = this.activeFilters.status;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.restaurantService.getCompanyList(dataTablesParameters).subscribe(result => {
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
   * 
   * @param filterName set filter to search
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

  setFilter(value, isChecked) {
    if (isChecked) {
      this.activeFilters.status = value;
    } else {
      this.activeFilters.status = null;
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

  navigateToRestaurantList(item) {
    this.router.navigate(['/company/restaurant/list'], { queryParams: { id: item.id, cn: item.name } });
  }

  viewCompany(item) {
    this.router.navigate(['/company/view'], { queryParams: { id: item.id } });
  }

  /**
 * open confirm
 */
  openConfirmStatus(item) {
    let text = item.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block');
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + ` ${text} ` + this.translate.instant('confirmMessages.thisCompany')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.updateCompanyStatus(item);
    })
  }
  /**
   * approve/reject company
   */
  updateCompanyStatus(item) {
    this.spinner.start();
    this.restaurantService.updateCompanyStatus(item).subscribe(
      data => {
        this.spinner.stop();
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
  openConfirmDelete(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription')+` `+this.translate.instant('confirmMessages.thisCompany')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.deleteRequest(item);
    })
  }
  /**
   * delete company request
   * @param item 
   */
  deleteRequest(item) {
    this.spinner.start();
    this.restaurantService.deleteCompany(item.id).subscribe(result => {
      this.toastService.success(result.message);
      this.spinner.stop();
      this.tableRefresh();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    })
  }
}
