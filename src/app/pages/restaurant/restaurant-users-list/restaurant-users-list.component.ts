import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { RestaurantService, UserService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { RestaurantUserFormComponent } from '../restaurant-user-from/restaurant-user-form.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-restaurant-users-list',
  templateUrl: './restaurant-users-list.component.html',
  styleUrls: ['./restaurant-users-list.component.scss']
})
export class RestaurantUsersListComponent implements OnInit {

  dataList = [];
  processing = false;
  clearing = false;
  customFilterData = {};
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  restaurantData: any = {};

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService, private userService: UserService, private spinner: SpinnerService, private toastService: ToastService,
    private translate : TranslateService) {
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
      pageLength: 10,
      ordering: true,
      lengthChange: false,
      order: [],
      columnDefs: [{ orderable: false, targets: -1 }],
      serverSide: true,
      processing: false,
      autoWidth: true,
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
      columns: [{ data: 'User Name', orderable: false },
      { data: 'User Type', orderable: false },
      // { data: 'Location', orderable: false },
      { data: 'Create On', orderable: true },
      { data: 'Action', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['restaurantId'] = this.route.snapshot.queryParams['id'];
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.restaurantService.getAllUsers(dataTablesParameters).subscribe(result => {
          this.spinner.stop();
          this.dataList = result.data;
          this.togglePagination();
          callback({
            recordsTotal: result.recordsTotal,
            recordsFiltered: result.recordsFiltered,
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
  }

  /**
   * filter data from table
   * @param filterName 
   * @param value 
   */
  tableSetFilter(filterName, value, event?) {
    if (filterName === 'search') {
      this.customFilterData[filterName] = { value, regex: false };
    } else {
      if (!this.customFilterData[filterName]) {
        this.customFilterData[filterName] = [];
        this.customFilterData[filterName].push(value);
      } else {
        if (event.target.checked) {
          let i = this.customFilterData[filterName].findIndex((r) => r === value);
          if (i == -1) {
            this.customFilterData[filterName].push(value);
          }
        } else {
          let i = this.customFilterData[filterName].findIndex((r) => r === value);
          if (i > -1) {
            this.customFilterData[filterName].splice(i, 1);
          }
        }
      }
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
   * customize the role text
   * @param text 
   * @returns 
   */
  customizeRoleText(text): string {
    return (text.replace('RESTAURANT_', ' ')).replaceAll('_', ' ').toLowerCase();
  }
  /**
    * open modal of add user
    */
  add() {
    const modalRef = this.modalService.open(RestaurantUserFormComponent, { centered: true });
    modalRef.componentInstance.isEditable = true;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.tableRefresh();
    })
  }

  /**
   * view the user details
   * @param item user
   */
  view(item, isEditable): void {
    const modalRef = this.modalService.open(RestaurantUserFormComponent, { centered: true });
    modalRef.componentInstance.userData = item;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.tableRefresh();
    })
  }

  /**
  * open modal to confirm status change
  */
  openConfirmStatusChange(item) {
    let text = item.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block');
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + ` ${text}` + this.translate.instant('confirmMessages.thisUser')+` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.changeStatus(item);
    })
  }
  /**
   * change status of user
  * @param item
  */
  changeStatus(item) {
    this.spinner.start();
    this.userService.changeStatus(item.id).subscribe(result => {
      this.toastService.success(result);
      this.tableRefresh();
    }, error => {
      ;
      this.spinner.stop();
      this.toastService.error(error);
    })
  }

  /**
  * open modal to confirm delete
  */
  openConfirmDelete(item) {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.thisUser')+ ` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.deleteRequest(item);
    })
  }
  /**
  * delete category request
  * @param item 
  */
  deleteRequest(item) {
    this.spinner.start();
    this.userService.delete(item.id).subscribe(result => {
      this.toastService.success(result.message);
      this.tableRefresh();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }

}
