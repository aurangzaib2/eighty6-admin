import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { defaultStatus, onBoardingRoles } from '../../../helpers';

@Component({
  selector: 'app-product-seller-list',
  templateUrl: './product-seller-list.component.html',
  styleUrls: ['./product-seller-list.component.scss']
})
export class ProductSellerListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  page = 1;
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { status: [], type: [] };
  statusList: string[] = [defaultStatus.UNAPPROVED, defaultStatus.REJECTED];
  subHeaderData;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private route: ActivatedRoute,
    private spinner: SpinnerService, private productService: ProductService, private location: Location, private router: Router, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.getParams();
  }
  getParams() {
    this.route.queryParams.subscribe(params1 => {
      if (params1['pid']) {
        this.subHeaderData = {
          productId: params1['pid'],
          productName: params1['pn']
        }
        this.route.paramMap.subscribe(params2 => {
          this.subHeaderData.categoryId = params2.get('id');
          this.subHeaderData.categoryName = params2.get('name');
          this.subHeaderData.subCategoryId = params2.get('id2');
          this.subHeaderData.subCategoryName = params2.get('name2');
          this.tableOptions();
        });
      }
    })
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
      columns: [{ data: 'name', width: '18%' }, { data: 'location', width: '16%' },
      { data: 'email', orderable: false, width: '20%' }, { data: 'mobileNumber', orderable: false, width: '20%' },
      { data: 'createdOn', orderable: false, width: '8%' }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        // this.customFilterData['categoryId'] = this.subHeaderData.categoryId;
        this.customFilterData['productId'] = this.subHeaderData.productId;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.productService.getProductSellerList(dataTablesParameters).subscribe(result => {
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

  setFilter(value, isChecked, type) {
    if (isChecked) {
      if (type === 'type') {
        if (value !== 'all') {
          this.activeFilters.type.push(value);
        } else {
          this.activeFilters.type = [];
        }
      } else {
        if (value !== 'all') {
          this.activeFilters.status.push(value);
        } else {
          this.activeFilters.status = [];
        }
      }
    } else {
      if (type === 'type') {
        if (value !== 'all') {
          let i = this.activeFilters.type.findIndex(v => v === value);
          this.activeFilters.type.splice(i, 1);
        } else {
          this.activeFilters.type = [];
        }
      } else {
        if (value !== 'all') {
          let i = this.activeFilters.status.findIndex(v => v === value);
          this.activeFilters.status.splice(i, 1);
        } else {
          this.activeFilters.status = [];
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
  navigateToProductView(value) {
    this.router.navigate([`/product/${this.subHeaderData.categoryId}/${this.subHeaderData.categoryName}//${this.subHeaderData.subCategoryId}/${this.subHeaderData.subCategoryName}/${value.name}/view`], { queryParams: { id: this.subHeaderData.productId, sid: value.id } });
  }
  goBackThrice() {
    window.history.go(-3);
  }
  goBackTwice() {
    window.history.go(-2);
  }
  goBack() {
    this.location.back();
  }
}
