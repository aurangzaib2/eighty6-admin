import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { OrdersService } from '../../../core/services/orders.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { currency, deliveryStatus, orderStatus, TAX } from '../../../helpers';
import { OrderInvoiceComponent } from '../../orders/order-invoice/order-invoice.component';

@Component({
  selector: 'app-supplier-order-view',
  templateUrl: './supplier-order-view.component.html',
  styleUrls: ['./supplier-order-view.component.scss']
})
export class SupplierOrderViewComponent implements OnInit {

  orderItems: any = [];
  order: any = [];
  dtOptions: DataTables.Settings = {};
  processing: boolean;
  clearing = false;
  customFilterData = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  orderId: string;
  deliveryStatus = deliveryStatus;
  orderStatus = orderStatus;
  setInt: any;
  newTime: number;
  activeStage: { status: string, icon: string };
  activePaymentStage: { status: string, icon: string };

  supplierData: any = {};
  currency = localStorage.getItem('currency');
  TAX: number;
  columns = ['productCode', 'productName', 'unit', 'quantity', 'unitPrice', 'totalAmount'];
  @ViewChild('orderItemTable') table: any;
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
    private router: Router, private supplierService: SupplierService, private route: ActivatedRoute,
    private toastService: ToastService, private spinner: SpinnerService, private location: Location, public translate: TranslateService) {
    config.placement = 'bottom-right';
    config.autoClose = true;
    configModal.backdrop = 'static';
    configModal.keyboard = false;
    this.TAX = this.currency === currency.UAE ? TAX.UAE : TAX.SA;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id'] && params['name']) {
        this.supplierData.id = params['id'];
        this.supplierData.name = params['name'];
      }
      this.route.queryParams.subscribe(params => {
        this.orderId = params['id'];
        this.getSubOrderDetails();
      })
    })
  }
  downloadInvoice() {
    const modalRef = this.modalService.open(OrderInvoiceComponent, { centered: true });
    modalRef.componentInstance.order = this.order;
    modalRef.result.then((result) => {
    }, (dismiss) => { });
  }
  onTreeAction(event: any) {
    const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.orderItems = [...this.orderItems];
  }
  checkIsAmended(row) {
    return {
      'yellow-200-bg': row?.isAmended === true
    };
  }
  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }
  getSubOrderDetails() {
    this.supplierService.getOrderById(this.orderId, this.supplierData.id).subscribe(data => {
      this.order = data;
      this.orderItems = data.orderItem;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    });
  }

  goBack() {
    this.location.back();
  }
}
