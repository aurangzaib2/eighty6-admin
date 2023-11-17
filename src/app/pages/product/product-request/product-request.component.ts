import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from "angular-datatables";
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductRequestFormComponent } from '../product-request-form/product-request-form.component';
import { AlertModalComponent } from '../../../shared';
import { confirmMessages } from '../../../helpers';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductReceiptComponent } from '../product-receipt/product-receipt.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-request',
  templateUrl: './product-request.component.html',
  styleUrls: ['./product-request.component.css']
})
export class ProductRequestComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  search: string = '';
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private productService: ProductService,
    private router: Router, private spinner: SpinnerService, private toastService: ToastService, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = false;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.tableOptions();
  }
  checkClass(status) {
    if (status === ('completed')) {
      return 'green-badge';
    }
    else if (status === ('process')) {
      return 'orange-badge';
    }
    else {
      return 'red-badge';
    }
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
      columns: [{ data: 'name', orderable: false },
      { data: 'supplierName', orderable: false }, { data: 'origin', orderable: false }, { data: 'action', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.productService.getAllRequestedProduct(dataTablesParameters).subscribe(result => {
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
   * 
   * @param filterName set filter to search
   * @param value 
   */
  setFilter(filterName, value) {
    if (filterName === 'search') {
      this.customFilterData[filterName] = { value, regex: false };
    } else {
      this.customFilterData[filterName] = value;
    }
    this.tableRefresh();
  }
  /**
  * open modal of edit product
  */
  openEdit(item, isEditable) {
    const modalRef = this.modalService.open(ProductRequestFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.id = item.id;
    modalRef.componentInstance.isEditable = isEditable;
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
    modalRef.componentInstance.title = confirmMessages.deleteTitle + 'product request';
    modalRef.componentInstance.description = confirmMessages.deleteDescription + `this product request ?`;
    modalRef.componentInstance.okText = 'Yes';
    modalRef.componentInstance.cancelText = 'No';
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.deleteRequest(item);
    })
  }
  /**
   * delete product request
   * @param item 
   */
  deleteRequest(item) {
    this.productService.deleteRequestedProduct(item).subscribe(result => {
      this.toastService.success(result.message);
      this.tableRefresh();
    }, error => {
      ;
      this.toastService.error(error);
    })
  }
}
