import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { OrdersService } from '../../../core/services/orders.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { paymentModes, deliveryStatus } from '../../../helpers';

@Component({
  selector: 'app-supplier-order-list',
  templateUrl: './supplier-order-list.component.html',
  styleUrls: ['./supplier-order-list.component.scss']
})
export class SupplierOrderListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  supplierData: any = {};
  activeFilters = { status: 'pending', deliveryStatus: [], paymentMethod: [] };
  paymentMethodFilterTypes = [paymentModes.CARD, paymentModes.CASH, paymentModes.CREDIT, paymentModes.WALLET];
  deliveryStatus = deliveryStatus;
  currency = localStorage.getItem('currency');
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private route: ActivatedRoute, private router: Router, private supplierService: SupplierService, private location: Location,
    private spinner: SpinnerService, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.supplierData = {
          id: params['id'],
          name: params['name']
        };
        console.log(this.supplierData)
        this.tableOptions();
      }
    });
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
      columns: [{ data: 'uniqueId', orderable: false, width:"18%" }, { data: 'name', orderable: true, width:"18%" }, { data: 'createdAt', orderable: true,width:"10%" },
      { data: 'createdAt', orderable: true,width:"8%" }, { data: 'status', orderable: false,width:"10%" },
      { data: 'totalPrice', orderable: true,width:"10%" }, { data: 'paymentStatus', orderable: false,width:"10%" },
      { data: 'commission', orderable: false,width:"8%" }, { data: 'timer', orderable: true,width:"10%" }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        dataTablesParameters.supplierId = this.supplierData.id;
        this.customFilterData['status'] = this.activeFilters.status;
        // this.customFilterData['deliveryStatus'] = this.activeFilters.deliveryStatus;
        // this.customFilterData['paymentMethod'] = this.activeFilters.paymentMethod;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.supplierService.getOrderList(dataTablesParameters).subscribe(result => {
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
      dtInstance.ajax.reload();
    });
  }

  /**
   * filter data from table
   * @param filterrestaurantName 
   * @param value 
   */
  tableSetFilter(filterrestaurantName, value) {
    if (filterrestaurantName === 'search') {
      this.customFilterData[filterrestaurantName] = { value, regex: false };
    } else {
      this.customFilterData[filterrestaurantName] = value;
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

  navigateToViewOrder(item) {
    this.router.navigate([`/supplier/${this.supplierData.name}/${this.supplierData.id}/order`], { queryParams: { id: item.uniqueId } });
  }
}
