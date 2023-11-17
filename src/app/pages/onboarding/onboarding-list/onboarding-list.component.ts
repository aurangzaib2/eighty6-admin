import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages, defaultStatus, onBoardingRoles } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';
import { OnboardingRejectComponent } from '../onboarding-reject/onboarding-reject.component';

@Component({
  selector: 'app-onboarding-list',
  templateUrl: './onboarding-list.component.html',
  styleUrls: ['./onboarding-list.component.scss']
})
export class OnboardingListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  page = 1;
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  onBoardingType = onBoardingRoles;
  activeFilters = { status: [], type: [] };
  statusList: string[] = [defaultStatus.UNAPPROVED, defaultStatus.REJECTED];
  subscription: Subscription;
  selectedLang: string;

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private router: Router,
    private spinner: SpinnerService, private onboardingService: OnboardingService, public languageService: LanguageService,
    private toastService: ToastService, public translate: TranslateService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
    this.getSelectedLanguage();
  }
  getSelectedLanguage() {

    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      this.translate.use(l)
      for (let i = 0; i < this.onBoardingType.length; i++) {
        const element = this.onBoardingType[i];
        this.translate.get(`onBoarding.${element.displayRole}`).subscribe((value) => {
          element.title = value
        })
      }
    })
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
      columns: [{
        data: 'type', width: '16%'
      }, { data: 'name', width: '25%' },
      { data: 'status', orderable: false, width: '16%' }, { data: 'time', orderable: false, width: '16%' },
      { data: 'date', orderable: true, width: '16%' }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        this.customFilterData['isFromAdmin'] = true;
        this.customFilterData['type'] = this.activeFilters.type;
        this.customFilterData['status'] = this.activeFilters.status;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.onboardingService.getAllUsers(dataTablesParameters).subscribe(result => {
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

  checkType(item): string {
    if (item.company && item.company.id && item.isStandalone === false) {
      return 'company';
    }
    else if (item.restaurant && item.restaurant.id) {
      return 'restaurant';
    }
    else {
      return 'supplier';
    }
  }
  /**
 * open reject
 */
  openReject(item) {
    let type = this.checkType(item);
    const modalRef = this.modalService.open(OnboardingRejectComponent, { centered: true });
    modalRef.componentInstance.userData = item[type];
    modalRef.componentInstance.userData.role = item.role;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.tableRefresh();
    })
  }
  /**
   * open confirm
   */
  openConfirm(item) {
    let text = 'approve';
    item.status = 'approved';
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = confirmMessages.hideDescription + `${text} this ${this.checkRoleName(item)} ?`;
    modalRef.componentInstance.okText = 'Confirm';
    modalRef.componentInstance.cancelText = 'Cancel';
    // modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.onSubmitStatus(item);
    })
  }
  /**
 * check the role name
 * @returns label name
 */
  checkRoleName(item): string {
    if (item.role.match('RESTAURANT_SUPER_ADMIN')) {
      return 'company';
    }
    else if (item.role.match('RESTAURANT_ADMIN')) {
      return 'restaurant';
    }
    else {
      return 'supplier';
    }
  }
  /**
 * change status(approve/reject)
 */
  onSubmitStatus(item) {
    let obj = {
      id: null,
      status: item.status
    }
    this.spinner.start();
    if (item.role.match('SUPPLIER')) {
      obj.id = item.supplier.id;
      this.approvedRejectSupplier(obj);
    }
    else if (item.role.match('RESTAURANT_ADMIN')) {
      obj.id = item.restaurant.id;
      this.approvedRejectRestaurant(obj);
    }
    else {
      obj.id = item.company.id;
      this.approvedRejectCompany(obj);
    }
  }
  /**
 * approve/reject supplier
 */
  approvedRejectSupplier(item) {
    this.onboardingService.approveRejectSupplier(item).subscribe(
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
  * approve/reject company
  */
  approvedRejectCompany(item) {
    this.onboardingService.approveRejectCompany(item).subscribe(
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
   * approve/reject restaurant
   */
  approvedRejectRestaurant(item) {
    this.onboardingService.approveRejectRestaurant(item).subscribe(
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
   * add new user
   */
  addUser() {
    this.router.navigate(['/onboarding/details'])
  }
  /**
   * edit user
   */
  editUser(item) {
    let type = this.checkType(item);
    this.router.navigate([`/onboarding/details/${this.checkType(item).slice(0, 1)}/${item[type].id}`]);
  }
}
