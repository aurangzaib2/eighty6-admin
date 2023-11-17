import { Component, OnInit, ViewChild } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import {
  NgbDropdownConfig,
  NgbModalConfig,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { CardService } from "../../../core";
import { CardFormComponent } from "../card-form/card-form.component";
import { SpinnerService } from "../../../core/services/spinner.service";
import { confirmMessages, userRoles } from "../../../helpers";
import { AlertModalComponent } from "../../../shared";
import { ToastService } from "../../../core/services/toast.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-cards-list",
  templateUrl: "./cards-list.component.html",
  styleUrls: ["./cards-list.component.scss"],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal],
})
export class CardsListComponent implements OnInit {
  dataList = [];
  processing = false;
  clearing = false;
  cardManagement = false;
  customFilterData = {};
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  userTypes = userRoles;
  selectedLang: string;

  constructor(
    config: NgbDropdownConfig,
    configModal: NgbModalConfig,
    private modalService: NgbModal,
    private cardService: CardService,
    private spinner: SpinnerService,
    private toastService: ToastService,
    public translate: TranslateService
  ) {
    // customize default values of dropdowns used by this component tree
    config.placement = "bottom-right";
    config.autoClose = true;

    // customize default values of modals used by this component tree
    configModal.backdrop = "static";
    configModal.keyboard = false;

    this.cardService.refreshTable.subscribe((data) => {
      this.tableRefresh();
    });
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
        if (this.cardManagement == true) {
          this.cardService.getAllCards(dataTablesParameters).subscribe(
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
        } else {
          this.cardService.getAllRestaurants(dataTablesParameters).subscribe(
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

  /**
   * open modal of add user
   */
  add() {
    const modalRef = this.modalService.open(CardFormComponent, {
      centered: true,
    });
    modalRef.componentInstance.isEditable = true;
    modalRef.result.then(
      (result) => {},
      (dismiss) => {
        this.tableRefresh();
      }
    );
  }

  /**
   * view the user details
   * @param item user
   */
  view(item, isEditable): void {
    const modalRef = this.modalService.open(CardFormComponent, {
      centered: true,
    });
    modalRef.componentInstance.isEditable = isEditable;
    modalRef.componentInstance.restaurantData = item;
    modalRef.result.then(
      (result) => {},
      (dismiss) => {
        this.tableRefresh();
      }
    );
  }

  setManageCards(val) {
    if (val == true) {
      this.cardManagement = true;
    } else {
      this.cardManagement = false;
    }
  }

  /**
   * open modal to confirm delete
   */
  openConfirmDelete(item) {
    const modalRef = this.modalService.open(AlertModalComponent, {
      centered: true,
    });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description =
      confirmMessages.deleteDescription + ` this card ?`;
    modalRef.componentInstance.okText = "Confirm";
    modalRef.componentInstance.cancelText = "Cancel";
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then(
      (result) => {},
      (dismiss) => {
        this.deleteRequest(item);
      }
    );
  }
  /**
   * delete category request
   * @param item
   */
  deleteRequest(item) {
    this.spinner.start();
    this.cardService.delete(item.id).subscribe(
      (result) => {
        this.toastService.success("Card deleted successfully");
        this.tableRefresh();
      },
      (error) => {
        this.toastService.error(error);
      }
    );
  }
}
