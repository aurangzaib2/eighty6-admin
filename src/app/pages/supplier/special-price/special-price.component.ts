import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { DataTableDirective } from "angular-datatables";
import { SharedService } from "../../../core";
import { LanguageService } from "../../../core/services/language.service";
import { ProductService } from "../../../core/services/product.service";
import { SpinnerService } from "../../../core/services/spinner.service";
import { SupplierService } from "../../../core/services/supplier.service";
import { ToastService } from "../../../core/services/toast.service";
import { confirmMessages, specialPriceErrors } from "../../../helpers";
import { AlertModalComponent } from "../../../shared";
import { validateField } from "../../../shared/validators/form.validator";
import { SpecialPriceFormComponent } from "../special-price-form/special-price-form.component";

@Component({
  selector: "app-special-price",
  templateUrl: "./special-price.component.html",
  styleUrls: ["./special-price.component.scss"],
  providers: [NgbModalConfig, NgbModal],
})
export class SpecialPriceComponent implements OnInit {
  restaurantList: any = [];
  marketListForm = new FormGroup({
    restaurantId: new FormControl(null, [Validators.required]),
    search: new FormControl(null),
  });
  errorMessages = specialPriceErrors;
  dataList = new FormArray([]);
  marketList: any = [];
  supplierProduct: any = [];
  dtOptions: DataTables.Settings = {};
  processing = false;
  clearing = false;
  customFilterData = {};
  search: string = "";
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  start: number = 0;
  length: number = 20;
  currentIndex: number;
  supplierId: number;
  @ViewChild("scrollMe") private myScrollContainer: ElementRef;
  selectedLang: string;

  constructor(
    private modalService: NgbModal,
    public route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    public languageService: LanguageService,
    private spinner: SpinnerService,
    private supplierService: SupplierService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.supplierId = params["id"];
      this.getRestaurantList();
      this.tableOptions();
    });
    this.selectedLang = localStorage.getItem('language');

  }

  get form() {
    return this.marketListForm.controls;
  }
  get field() {
    return this.dataList?.controls[this.currentIndex]?.value.id === null;
  }
  getRestaurantList() {
    this.spinner.start();
    this.supplierService.getRestaurants(this.supplierId).subscribe(
      (result) => {
        this.restaurantList = result;
        this.spinner.stop();
      },
      (error) => {
        this.spinner.stop();
        // ;
      }
    );
  }
  getSupplierProduct() {
    let params = {
      start: this.start,
      length: this.length,
      supplierId: this.supplierId,
    };
    if (this.search) {
      params["search"] = this.search;
    }
    this.supplierService.getSupplierProduct(params).subscribe((data) => {
      this.supplierProduct = data;
      this.spinner.stop();
    });
  }
  /**
   * to search a category
   */
  onSearch($event) {
    this.search = $event.term;
    this.supplierProduct = [];
    this.start = 0;
    this.getSupplierProduct();
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
      columns: [
        { data: "product name", orderable: false },
        { data: "price", orderable: false },
        { data: "discountedPrice", orderable: false },
        { data: "action", orderable: false },
        { data: "isPrivateProduct", orderable: false },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        if (this.form.restaurantId.value) {
          this.customFilterData["restaurantId"] = this.form.restaurantId.value;
          this.customFilterData["supplierId"] = this.supplierId;
          for (let key in this.customFilterData) {
            dataTablesParameters[key] = this.customFilterData[key];
          }
          this.supplierService.getMarketList(dataTablesParameters).subscribe(
            (result) => {
              this.marketList = result.data;
              this.dataList.clear();
              for (let i = 0; i < this.marketList.length; i++) {
                let data = this.marketList[i];
                let formGroup = this.fb.group({
                  id: data.id,
                  price: data.price,
                  specialPrice: new FormControl(data.specialPrice, [
                    Validators.required,
                  ]),
                  productId: new FormControl(data.productId, [
                    Validators.required,
                  ]),
                  supplierInventoryId: data.supplierInventoryId,
                  supplierId: data.supplierId,
                  restaurantId: data.restaurantId,
                  name: data.name,
                  Aname: data.nameTranslation.ar,
                  isPrivateProduct: data.isPrivateProduct,
                });
                formGroup.disable();
                this.dataList.push(formGroup);
              }
              this.togglePagination();
              callback({
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                data: [],
              });
              this.spinner.stop();
            },
            (error) => {
              // ;
              this.spinner.stop();
            }
          );
        }
      },
    };
  }
  listSearch(){
    
    let params = {
      search: this.form.search.value,
      restaurantId : this.form.restaurantId.value,
      supplierId : this.supplierId
    }

    this.supplierService.getMarketList(params).subscribe(result => {
      this.marketList = result.data;
      this.dataList.clear();
      for (let i = 0; i < this.marketList.length; i++) {
        let data = this.marketList[i];
        let formGroup = this.fb.group({
          id: data.id,
          price: data.price,
          specialPrice: new FormControl(data.specialPrice, [
            Validators.required,
          ]),
          productId: new FormControl(data.productId, [
            Validators.required,
          ]),
          supplierInventoryId: data.supplierInventoryId,
          supplierId: data.supplierId,
          restaurantId: data.restaurantId,
          name: data.name
        });
        formGroup.disable();
        this.dataList.push(formGroup);
      }
      this.togglePagination();
      // callback({
      //   recordsTotal: result.recordsTotal,
      //   recordsFiltered: result.recordsFiltered,
      //   data: []
      // });
      this.spinner.stop();
    }, error => {
      // ;
      this.spinner.stop();
    })
  }
  selectProduct(data, index) {
    let currentValue = this.dataList.at(index);
    if (currentValue.value.id === null) {
      // let data = this.supplierProduct.find(x => x.id === currentValue.value.supplierInventoryId);
      this.dataList.at(index).patchValue({
        id: null,
        price: data.discountedPrice || data.price,
        specialPrice: null,
        productId: data.productId,
        supplierInventoryId: data.id,
        supplierId: this.supplierId,
        restaurantId: this.form.restaurantId.value,
        name: data.name,
        isPrivateProduct: data.isPrivateProduct,
      });
    }
  }
  toggleAccess(formGroup: FormGroup, index = null) {
    if (formGroup.enabled) {
      formGroup.disable();
    } else {
      formGroup.enable();
      this.onSearch({ term: formGroup.controls.name.value });
    }
    if (index != null) {
      this.currentIndex = index;
    }
  }
  addNewMarket() {
    if (this.marketListForm.invalid) {
      validateField(this.marketListForm);
      return;
    }
    for (let i = 0; i < this.dataList.length; i++) {
      this.dataList.disable();
    }
    let formGroup = this.fb.group({
      id: null,
      price: null,
      specialPrice: new FormControl(null, [Validators.required]),
      productId: new FormControl("", [Validators.required]),
      supplierInventoryId: null,
      supplierId: this.supplierId,
      restaurantId: null,
      isPrivateProduct: false,
    });
    formGroup.enable();
    this.dtOptions.pageLength += 1;
    this.dataList.push(formGroup);
    this.currentIndex = this.dataList.length - 1;
  }
  /**
   * add and update
   */
  onSubmit() {
    if (this.marketListForm.invalid) {
      validateField(this.marketListForm);
      return;
    }
    if (this.dataList.controls[this.currentIndex].invalid) {
      validateField(this.dataList.controls[this.currentIndex]);
      return;
    }
    this.spinner.start();
    if (this.dataList.controls[this.currentIndex].value.id === null) {
      this.supplierService
        .addMarketList(this.dataList.controls[this.currentIndex].value)
        .subscribe(
          (result) => {
            this.tableRefresh();
            this.currentIndex++;
            this.toastService.success(result.message);
          },
          (error) => {
            this.spinner.stop();
            this.toastService.error(error);
          }
        );
    } else {
      this.supplierService
        .updateMarketList(this.dataList.controls[this.currentIndex].value)
        .subscribe(
          (result) => {
            this.tableRefresh();
            this.toastService.success(result.message);
          },
          (error) => {
            this.spinner.stop();
            this.toastService.error(error);
          }
        );
    }
  }

  openConfirm(_, index) {
    if (_.value.id === null) {
      this.dataList.removeAt(index);
      return;
    }
    const modalRef = this.modalService.open(AlertModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title =
      this.translate.instant("confirmMessages.deleteTitle") +
      ` ` +
      this.translate.instant("confirmMessages.product");
    modalRef.componentInstance.description =
      this.translate.instant("confirmMessages.deleteDescription") +
      ` ` +
      this.translate.instant("confirmMessages.thisProduct") +
      ` ?`;
    modalRef.componentInstance.okText = this.translate.instant(
      "confirmMessages.yes"
    );
    modalRef.componentInstance.cancelText =
      this.translate.instant("confirmMessages.no");
    modalRef.result.then(
      (result) => {
        // console.log(result)
      },
      (dismiss) => {
        this.deleteRequest(_.value);
      }
    );
  }
  /**
   * delete category request
   * @param item
   */
  deleteRequest(item) {
    this.spinner.start();
    this.supplierService.deleteMarketList(item.id).subscribe(
      (result) => {
        this.toastService.success(result.message);
        this.tableRefresh();
      },
      (error) => {
        this.toastService.error(error);
        this.spinner.stop();
      }
    );
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
    this.marketListForm.controls.search.setValue('');
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  open() {
    if (this.marketListForm.invalid) {
      validateField(this.marketListForm);
      return;
    }
    const modalRef = this.modalService.open(SpecialPriceFormComponent, {
      centered: true,
      size: "lg",
    });
    modalRef.componentInstance.restaurantId = this.form.restaurantId.value;
    modalRef.result.then(
      (result) => {
        // console.log(result);
      },
      (dismiss) => {
        this.spinner.start();
        this.tableRefresh();
      }
    );
  }
}
