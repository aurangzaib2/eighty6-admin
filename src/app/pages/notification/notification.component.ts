import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { MetadataService } from '../../core/services/metadata.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  dataList: any = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { status: [] };
  selectedLang: string;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private metaDataService: MetadataService, private toastService: ToastService, private router: Router,
    private spinner: SpinnerService, public translate: TranslateService) { }

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
      ordering: false,
      lengthChange: false,
      order: [],
      columnDefs: [{ orderable: false, targets: 0 }],
      serverSide: true,
      processing: false,
      scrollY: '58vh',
      scrollX: true,
      language: {
        paginate: {
          next: '>', // or '→'
          previous: '<',
          first: '',
          last: '' // or '←'
        }
      },
      columns: [{ data: 'subject', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['status'] = this.activeFilters.status;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.metaDataService.getNotificationList(dataTablesParameters).subscribe(result => {
          this.spinner.stop();
          this.dataList = result.data;
          this.togglePagination();
          callback({
            recordsTotal: result.recordsTotal,
            recordsFiltered: result.recordsFiltered,
            data: []
          });
        }, error => {
          // ;
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
  navigation(item) {
    if (item.type === 'order') {
      this.router.navigate([`/orders/view/${item?.additional?.uniqueId}`]);
    }
    else if (item.type == "chat_message") {
      let id = JSON.parse(item?.additional)?.channelUrl;
      this.router.navigate([`/chat/`], { queryParams: { id: id } });
    }
    else if (item.type === "promotion_request") {
      this.router.navigate([`marketing/list/request`]);
    }
    else if (item.type === "product_request") {
      this.router.navigate([`/product/request/`]);
    }
    else if (item.type === "registration_request") {
      this.router.navigate([`/registration/list/`]);
    }
    else if (item.type === "ticket") {
      this.router.navigate([`tickets/view/${item?.additional.id}`]);
    }
  }
}
