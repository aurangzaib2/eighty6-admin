import { Component, OnInit, ViewChild } from "@angular/core"; 
import { DataTableDirective } from "angular-datatables";
import {
  NgbDropdownConfig,
  NgbModalConfig,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { WalletService } from "../../../core";
import { SpinnerService } from "../../../core/services/spinner.service";
import { confirmMessages, userRoles } from "../../../helpers";
import { ToastService } from "../../../core/services/toast.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

import { Router } from "@angular/router";
import { AlertModalComponent } from "../../../shared";
@Component({
  selector: "app-wallets-list",
  templateUrl: "./wallets-list.component.html",
  styleUrls: ["./wallets-list.component.scss"],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal],
})
export class WalletsListComponent implements OnInit {
  model: NgbDateStruct;

  dataList = [];
  processing = false;
  clearing = false;
  customFilterData = {};
  walletFilterSelected = true;
  restaurantFilterSelected = false;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  userTypes = userRoles;
  selectedItem: any = {};
  selectedLang: string;

  constructor(
    config: NgbDropdownConfig,
    configModal: NgbModalConfig,
    private modalService: NgbModal,
    private walletService: WalletService,
    private spinner: SpinnerService,
    private toastService: ToastService,
    public translate: TranslateService,
    private router: Router
  ) {
    // customize default values of dropdowns used by this component tree
    config.placement = "bottom-right";
    config.autoClose = true;

    // customize default values of modals used by this component tree
    configModal.backdrop = "static";
    configModal.keyboard = false;

    this.walletService.refreshTable.subscribe((data) => {
      this.tableRefresh();
    });
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    this.tableOptions();
  }
  getUserName(firstName, lastName) {
    return `${firstName} ${lastName}`;
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
      scrollY: "42vh",
      scrollX: true,
      language: {
        paginate: {
          next: ">", // or '→'
          previous: "<",
          first: "",
          last: "", // or '←'
        },
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.start();
        for (let key in this.customFilterData) {
          dataTablesParameters[key] = this.customFilterData[key];
        }
        if (this.walletFilterSelected == true) {
          this.walletService.getAllWallets(dataTablesParameters).subscribe(
            (result) => {
              this.spinner.stop();
              this.dataList = result.data;
              this.togglePagination();
              callback({
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                data: [],
              });
            },
            (error) => {
              this.spinner.stop();
            }
          );
        } else if (this.restaurantFilterSelected == true) {
          this.walletService.getAllRestaurants(dataTablesParameters).subscribe(
            (result) => {
              this.spinner.stop();
              this.dataList = result.data;
              this.togglePagination();
              callback({
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                data: [],
              });
            },
            (error) => {
              this.spinner.stop();
            }
          );
        }
      },
    };
  }
  togglePagination() {
    let tabElements = document.getElementsByClassName("dataTables_paginate");
    let tabToDisplay = tabElements.item(0) as HTMLElement;
    if (this.dataList.length === 0) {
      tabToDisplay.style.display = "none";
    } else {
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
   * @param filterName
   * @param value
   */
  tableSetFilter(filterName, value, event?) {
    if (filterName === "search") {
      this.customFilterData[filterName] = { value, regex: false };
    } else if (filterName === "debit") {
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = true;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "credit") {
      this.customFilterData["credit"] = true;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "sarCurrency") {
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = true;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "aedCurrency") {
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = true;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "restaurantId") {
    } else if (filterName === "kwdCurrency") {
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = true;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "restaurantId") {
      this.customFilterData[filterName] = value;
    } else if (filterName === "all") {
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
      this.customFilterData["myTransactions"] = false;
    } else if (filterName === "myTransactions") {
      this.customFilterData["myTransactions"] = true;
      this.customFilterData["credit"] = false;
      this.customFilterData["debit"] = false;
      this.customFilterData["aedCurrency"] = false;
      this.customFilterData["sarCurrency"] = false;
      this.customFilterData["kwdCurrency"] = false;
      this.customFilterData["restaurantId"] = null;
    } else if (filterName === "startDate") {
      this.customFilterData["startDate"] = value;
    } else if (filterName === "endDate") {
      this.customFilterData["endDate"] = value;
    } else {
      if (!this.customFilterData[filterName]) {
        this.customFilterData[filterName] = [];
        this.customFilterData[filterName].push(value);
      } else {
        if (event.target.checked) {
          let i = this.customFilterData[filterName].findIndex(
            (r) => r === value
          );
          if (i == -1) {
            this.customFilterData[filterName].push(value);
          }
        } else {
          let i = this.customFilterData[filterName].findIndex(
            (r) => r === value
          );
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

  onOptionsSelected(value) {
    if (value == "aedCurrency") {
      this.tableSetFilter("aedCurrency", true);
    } else if (value == "sarCurrency") {
      this.tableSetFilter("sarCurrency", true);
    } else if (value == "debit") {
    } else if (value == "kwdCurrency") {
      this.tableSetFilter("kwdCurrency", true);
    } else if (value == "debit") {
      this.walletFilterSelected = true;
      this.restaurantFilterSelected = false;
      this.tableSetFilter("debit", true);
    } else if (value == "credit") {
      this.walletFilterSelected = true;
      this.restaurantFilterSelected = false;
      this.tableSetFilter("credit", true);
    } else if (value == "restaurant") {
      this.walletFilterSelected = false;
      this.restaurantFilterSelected = true;
    } else if (value == "all") {
      this.walletFilterSelected = true;
      this.restaurantFilterSelected = false;
      this.tableSetFilter("all", true);
    } else if (value == "myTransactions") {
      this.walletFilterSelected = true;
      this.restaurantFilterSelected = false;
      this.tableSetFilter("myTransactions", true);
    }
  }

  walletsAgainstRestaurants(id) {
    this.walletFilterSelected = true;
    this.restaurantFilterSelected = false;
    this.tableSetFilter("restaurantId", id);
  }

  firstDateSelected(event) {
    let startDateSelected = `${event.year}-${event.month}-${event.day} 00:00:00.101+00`;
    this.tableSetFilter("startDate", startDateSelected);
  }

  lastDateSelected(event) {
    let endDateSelected = `${event.year}-${event.month}-${event.day} 00:00:00.101+00`;
    this.tableSetFilter("endDate", endDateSelected);
  }

  navigateTo(item) {
    if (item.uniqueId && item.supplierId) {
      this.router.navigate([`/orders/view/${item.uniqueId}`], {
        queryParams: { sid: item.supplierId },
      });
    }
  }

  /**
   * open modal to confirm update
   */
  openConfirm(item) {
    this.selectedItem = item;

    const modalRef = this.modalService.open(AlertModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title = confirmMessages.updateTitle + "Order";
    modalRef.componentInstance.description =
      confirmMessages.updateDescription + ` this order ?`;
    modalRef.componentInstance.okText = "Yes";
    modalRef.componentInstance.cancelText = "No";
    modalRef.result.then(
      (result) => {
        // alert("result");
      },
      (dismiss) => {
        // alert("dismiss");
       this.updatePaymentStatus();
      }
    );
    
  }

  updatePaymentStatus() {
    // console.log(this.selectedItem)
    this.spinner.start();

    let obj = {
      id: this.selectedItem.id,
      status: this.selectedItem.isPaid === 'Paid' ? false : true
    }
    
    this.walletService.updatePaymentStatus(obj).subscribe(result => {
      this.spinner.stop();
      console.log('update payment status', result)
      this.toastService.success(result.message);
      this.tableRefresh();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    })
  }
}
