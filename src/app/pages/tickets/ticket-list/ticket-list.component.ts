
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from "angular-datatables";
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { Router } from '@angular/router';
import { TicketsService } from '../../../core/services/tickets.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { onBoardingRoles, ticketStatus } from '../../../helpers';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { Role, UserService } from '../../../core';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {

  dataList = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  ticketStatus = [
    {
      key: ticketStatus.OPEN,
      value: ticketStatus.OPEN,
    },
    {
      key: ticketStatus.IN_PROGRESS,
      value: ticketStatus.IN_PROGRESS,
    },
    {
      key: ticketStatus.CLOSED,
      value: ticketStatus.CLOSED,
    }
  ];
  activeFilters = { status: [] };
  subscription: Subscription;
  shouldCreateTicket: boolean = false;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private changeDetection: ChangeDetectorRef,
    private router: Router, private ticketService: TicketsService, private spinner: SpinnerService, public translate: TranslateService,
    public languageService: LanguageService, private userService: UserService) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
    configModal.backdrop = 'static';
    configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(data => {
      this.shouldCreateTicket = data.role === Role.SYSTEM_OWNER ? false : true;
    })
    this.getSelectedLanguage();
    this.tableOptions();
  }
  /**
   * add class
   */
  checkClass(status) {
    if (status === ticketStatus.CLOSED) {
      return 'green-badge';
    }
    else if (status === ticketStatus.IN_PROGRESS) {
      return 'orange-badge';
    }
    else {
      return 'blue-badge';
    }
  }
  /**
 * customize the role text
 * @param text 
 * @returns 
 */
  customizeRoleText(text): string {
    if (onBoardingRoles[0].role === text) {
      return this.translate.instant('onBoarding.company');
    }
    else if (onBoardingRoles[1].role === text) {
      return this.translate.instant('onBoarding.restaurant');
    } 
    else if (onBoardingRoles[2].role === text){
      return this.translate.instant('onBoarding.supplier');
    }
    return text.replaceAll('_', ' ').toLowerCase();
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
      columns: [{ data: 'id', orderable: false }, { data: 'type', orderable: false },
      { data: 'subject', orderable: false }, { data: 'createdAt', orderable: true },
      { data: 'status', orderable: false },],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        // this.customFilterData['status'] = this.activeFilters.status;
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        this.customFilterData['status'] = this.activeFilters.status;
        this.ticketService.getAllTickets(dataTablesParameters).subscribe(result => {
          this.spinner.stop();
          this.dataList = result.data;
          this.togglePagination();
          callback({
            recordsTotal: 10,
            recordsFiltered: 2,
            data: []
          });
        }, error => {
          console.log(error);
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
    // console.log('in refresh')
  }

  /**
   * filter data from table
   * @param filterName 
   * @param value 
   */
  tableSetFilters(filterName, value, event?) {

    if (filterName === 'search') {
      this.customFilterData[filterName] = { value, regex: false };
    }
    else if (filterName === 'search' && value.length > 0) {
      this.customFilterData[filterName] = '';
    }
    else {
      if (event.target.checked) {
        if (value !== 'all') {
          this.activeFilters.status.push(value);
        } else {
          this.activeFilters.status = [];
        }
      } else {
        let i = this.activeFilters.status.findIndex(v => v === value);
        this.activeFilters.status.splice(i, 1);
      }
    }
    this.changeDetection.detectChanges();
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
   * open modal of restaurant
   */
  open() {
    const modalRef = this.modalService.open(TicketFormComponent, { centered: true });
    modalRef.result.then((result) => {
      // console.log(result);
    }, (dismiss) => {
      // console.log(dismiss);
      this.tableRefresh();
    })
  }


  navigateTo(item) {
    this.router.navigate([`tickets/view/${item.id}`])
  }
  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (l == 'ar') {
        this.translate.use(l)
        for (let i = 0; i < this.ticketStatus.length; i++) {
          let element = this.ticketStatus[i];
          this.translate.get(`tickets.${element.value}`).subscribe((value) => {
            element.key = value
          })
        }
      }
      if (l == 'en') {
        this.translate.use(l)
        for (let i = 0; i < this.ticketStatus.length; i++) {
          let element = this.ticketStatus[i];
          this.translate.get(`tickets.${element.value}`).subscribe((value) => {
            element.key = value
          })
        }
      }
    })
  }
}
