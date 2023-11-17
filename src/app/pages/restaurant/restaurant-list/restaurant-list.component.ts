import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from "angular-datatables";
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class RestaurantListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  page = 1;
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  activeFilters = { paymentStatus: null };
  companyData = { id: null, name: null };
  selectedLang: string;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router,
    private route: ActivatedRoute, private location: Location,
    private spinner: SpinnerService, private restaurantService: RestaurantService, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.getParam();
    this.selectedLang = localStorage.getItem('language');

  }
  getParam() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.companyData = {
          id: params['id'],
          name: params['cn']
        }
        this.tableOptions();
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
      columns: [{ data: 'name', orderable: true, width:"20%"},
      { data: 'location', orderable: true,width:"20%" }, { data: 'contactPerson', orderable: true,width:"20%" },
      { data: 'email', orderable: true,width:"20%" }, { data: 'mobileNumber', orderable: true,width:"20px" }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['companyId'] = this.companyData.id;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.restaurantService.getRestaurantList(dataTablesParameters).subscribe(result => {
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
      this.activeFilters.paymentStatus = value;
    } else {
      this.activeFilters.paymentStatus = null;
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
  goBack() {
    this.location.back();
  }

  navigateToRestaurantView(item) {
    this.router.navigate([`/company/${item.name}/restaurant/info`], { queryParams: { cid: this.companyData.id, cn: this.companyData.name, id: item.id } });
  }
}
