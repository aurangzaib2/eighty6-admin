import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { SubCategoryFormComponent } from '../sub-category-form/sub-category-form.component';

@Component({
  selector: 'app-sub-category-listing',
  templateUrl: './sub-category-listing.component.html',
  styleUrls: ['./sub-category-listing.component.scss']
})
export class SubCategoryListingComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  search: string = '';
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  categoryData = { id: null, name: null };
  selectedLang: string;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private productService: ProductService,
    private router: Router, private spinner: SpinnerService, private route: ActivatedRoute, private toastService: ToastService,
    private location: Location, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = false;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    this.getParams();

  }
  /**
 * get params from url
 */
  getParams() {
    this.spinner.start();
    this.route.paramMap.subscribe(params => {
      if (params.get('id')) {
        this.categoryData.id = params.get('id');
        if (this.selectedLang == 'en') {
          this.categoryData.name = params.get('name');
        }
        if (this.selectedLang == 'ar') {
          this.categoryData.name = params.get('nameArabic');
        }
        this.tableOptions();
      }
      else {
        // this.goBack();
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
      columns: [{ data: 'name', orderable: false },
      { data: 'itemCount', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        dataTablesParameters['parentId'] = this.categoryData.id;
        this.productService.getSubCategory(dataTablesParameters).subscribe(result => {
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
  open() {
    const modalRef = this.modalService.open(SubCategoryFormComponent, { centered: true });
    modalRef.componentInstance.catID = this.categoryData.id;

    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.tableRefresh();
    })
  }
  navigateToProduct(item) {
    let subCatName;
    if (this.selectedLang == 'en' && item.name) {
       subCatName = item.name
    }
    if (this.selectedLang == 'en' && !item.name) {
      subCatName = item.nameTranslation.en
    }
    if (this.selectedLang == 'ar' && item.nameTranslation.ar) {
      subCatName = item.nameTranslation.ar
    }
    if (this.selectedLang == 'ar' && !item.nameTranslation.ar) {
      subCatName = item.name
    }
    this.router.navigateByUrl(`/product/${this.categoryData.id}/${this.categoryData.name}/${item.id}/${subCatName}/list`);
  }
  goBack() {
    this.location.back();
  }
}
