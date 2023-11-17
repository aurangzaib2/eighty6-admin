import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { SpinnerService } from '../../../core/services/spinner.service';
import { OrdersService } from '../../../core/services/orders.service';
import { orderStatus, deliveryStatus, currency, TAX, confirmMessages, defaultStatus } from '../../../helpers';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { PdfMakeService } from '../../../core/services/pdfmake.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { Location } from '@angular/common';
import { AlertModalComponent } from '../../../shared';
import { OrderInvoiceComponent } from '../order-invoice/order-invoice.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';  

@Component({
    selector: 'app-order-view',
    templateUrl: './order-view.component.html',
    styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit {
    tokenForm: FormGroup;
    orderItems: any = [];
    order: any;
    dtOptions: DataTables.Settings = {};
    processing: boolean;
    clearing = false;
    customFilterData = {};
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    orderId: string;
    supplierId: string;
    deliveryStatus = deliveryStatus;
    orderStatus = orderStatus;
    setInt: any;
    newTime: number;
    activeStage: { status: string, icon: string };
    activePaymentStage: { status: string, icon: string };
    deliveryStages = [{ status: deliveryStatus.CONFIRMED, icon: 'assets/icons/status-dispatched.svg' },
    { status: deliveryStatus.DISPATCHED, icon: 'assets/icons/status-pending.svg' },
    { status: deliveryStatus.DELIVERED, icon: 'assets/icons/status-dispatched.svg' },
    { status: deliveryStatus.COMPLETE, icon: 'assets/icons/status-paid.svg' }];

    paymentStages = [
        { status: orderStatus.PAID, icon: 'assets/icons/status-pending.svg' },
        { status: orderStatus.PENDING_PAYMENT, icon: 'assets/icons/status-paid.svg' }];

    activeTab: string = 'pending';
    currency = localStorage.getItem('currency');
    TAX: number;
    statusType: string;
    columns = ['productCode', 'productName', 'unit', 'quantity', 'unitPrice', 'totalAmount'];
    @ViewChild('orderItemTable') table: any;
    link: string;
    token: any;
    isCopied: boolean;
    region: string;
    ackOrder: any;

    constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
        private router: Router, private orderService: OrdersService, private route: ActivatedRoute,
        private toastService: ToastService, private spinner: SpinnerService, public translate: TranslateService, private metaDataService: MetadataService,
        private pdfMakeService: PdfMakeService, private location: Location,private fb: FormBuilder,private metaTagService: Meta) {
        config.placement = 'bottom-right';
        config.autoClose = true;
        configModal.backdrop = 'static';
        configModal.keyboard = false;
        // this.TAX = this.currency === currency.UAE ? TAX.UAE : TAX.SA;
        if (this.currency === currency.UAE) {
            this.TAX = TAX.UAE;
        }
        if (this.currency === currency.SA) {
            this.TAX = TAX.SA;
        }
        if(this.currency === currency.KW){
this.TAX = TAX.KW
        }
        this.metaTagService.addTags([  
            { name: 'keywords', content: 'Angular SEO Title, Meta Description, Meta Keyword Example' },  
            { name: 'robots', content: 'index, follow' },  
            { charset: 'UTF-8' }  
          ]);  
    }

    ngOnInit(): void {      
        this.orderId = this.route.snapshot.params['id'];
        this.supplierId = this.route.snapshot.queryParams['sid'];
        this.spinner.start();
        if (this.orderId) {
            this.getSubOrderDetails();
            this.createForm();
            this.getTokenId();
        }
        // this.tableOptions();
        this.region = localStorage.getItem('region');

    }
    createForm(){
        this.tokenForm = this.fb.group({
            id: this.orderId
        });
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
    downloadInvoice() {
        const modalRef = this.modalService.open(OrderInvoiceComponent, { centered: true });
        modalRef.componentInstance.order = this.order;
        modalRef.result.then((result) => {
        }, (dismiss) => { });
    }

    getSubOrderDetails() {
        this.orderService.getOrderDetails(this.orderId, this.supplierId).subscribe(data => {
            this.order = data;
            this.orderItems = data.orderItem;
            this.getType();
            this.spinner.stop();
        }, error => {
            this.spinner.stop();
        });
    }
    getTokenId(){
        let payload = this.tokenForm.value;
        this.orderService.getToken(payload).subscribe(data => {
            this.token = data.token;
        this.link = 'You have an order! Eighty6 is the first marketplace connecting restaurants with suppliers. https://supplier.eighty6.shop/pub-order/view?token=' + this.token;
            
        }, error => {
    
        });
    }
    copyText(val: string){
        let selBox = document.createElement('textarea');
          selBox.style.position = 'fixed';
          selBox.style.left = '0';
          selBox.style.top = '0';
          selBox.style.opacity = '0';
          selBox.value = val;
          document.body.appendChild(selBox);
          selBox.focus();
          selBox.select();
          document.execCommand('copy');
          document.body.removeChild(selBox);
          this.toastService.success('Copied');
          this.isCopied = true

        }
    getType() {
        let status = this.order.deliveryStatus;
        if (status === deliveryStatus.PENDING) {
            this.activeTab = 'pending';
            this.translate.get('suppliers.newOrder').subscribe(data => {
                this.statusType = data;
            });
        } else if ((status === deliveryStatus.DELIVERED || status === deliveryStatus.REJECTED) && (this.order.acknowledgeStatus === deliveryStatus.CONFIRMED || this.order.acknowledgeStatus === deliveryStatus.PENDING)) {
            this.activeTab = 'completed';
            this.translate.get('suppliers.orderHistory').subscribe(data => {
                this.statusType = data;
            });
        }
        // else if ([defaultStatus.PENDING, defaultStatus.REJECTED, deliveryStatus.PARTIALLY].includes(this.order.amendOrderStatus) && status === deliveryStatus.DELIVERED) {
            else if ([defaultStatus.PENDING, defaultStatus.REJECTED , deliveryStatus.PARTIALLY , deliveryStatus.ACKNOWLEDGE, deliveryStatus.RETURNED].includes(this.order.amendOrderStatus) 
            && (status === deliveryStatus.DELIVERED || status === deliveryStatus.RETURNED || status === deliveryStatus.REJECTED )
            && status != 'confirmed' && status != 'dispatched' && status != 'pending') {
        this.activeTab = 'acknowledged';
            this.translate.get('suppliers.acknowledgeOrder').subscribe(data => {
                this.statusType = data;
            });
        }
        else {
            this.activeTab = 'active';
            this.translate.get('suppliers.activeOrder').subscribe(data => {
                this.statusType = data;
            });
        }
    }

    /**
* open modal to confirm delete
*/
    openConfirmDelete() {
        const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
        modalRef.componentInstance.title = confirmMessages.deleteTitle + 'Order';
        modalRef.componentInstance.description = confirmMessages.deleteDescription + ` this Order ?`;
        modalRef.componentInstance.okText = 'Yes';
        modalRef.componentInstance.cancelText = 'No';
        modalRef.result.then((result) => {
        }, (dismiss) => {
            this.deleteRequest();
        })
    }
    /**
    * delete category request
    * @param item 
    */
    deleteRequest() {
        this.spinner.start();
        this.orderService.deleteOrder(this.order.id).subscribe(result => {
            this.toastService.success(result.message);
            this.goBack();
        }, error => {
            this.toastService.error(error);
        })
    }

    goBack() {
        this.location.back();
    }
    showDownArrow(i){
        this.ackOrder =  this.orderItems[i].orderAmendItems[0];
       
  
      }
}
