import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { defaultStatus, onBoardingRoles } from '../../../helpers';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss']
})
export class SupplierListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  page = 1;
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  onBoardingType = onBoardingRoles;
  activeFilters = { status: [], isOnBoarded: 'all' };
  statusList: string[] = [defaultStatus.UNAPPROVED, defaultStatus.REJECTED];
  selectedLang: string;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router,
    private spinner: SpinnerService, private supplierService: SupplierService, private location: Location, public translate: TranslateService) {
    // customize default values of dropdown used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    this.tableOptions();
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
      // scrollX: true,
      language: {
        paginate: {
          next: '>', // or '→'
          previous: '<',
          first: '',
          last: '' // or '←'
        }
      },
      columns: [{ data: 'name', orderable: true, width: '18%' }, { data: 'contactPerson', orderable: false, width: '18%' },
      { data: 'location', orderable: true, width: '16%' },
      { data: 'email', orderable: true, width: '18%' }, { data: 'mobileNumber', orderable: true, width: '18%' },
      { data: 'createdOn', orderable: true }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['status'] = this.activeFilters.status;
        this.customFilterData['isOnBoarded'] = this.activeFilters.isOnBoarded;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.supplierService.getAllSupplierUsers(dataTablesParameters).subscribe(result => {
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
      this.activeFilters.isOnBoarded = value;
    } else {
      this.activeFilters.isOnBoarded = 'all';
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
  navigateToSupplierView(item) {
    this.router.navigate([`/supplier/catalogue`], { queryParams: { id: item.id, sn: item.name } });
  }
}
