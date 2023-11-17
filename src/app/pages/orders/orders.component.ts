import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { paymentModes, deliveryStatus } from '../../helpers';
import { LanguageService } from '../../core/services/language.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {

    // links : Array<any> =[];
    links = [{ title: '', translateWord: 'newOrder', status: 'pending', image: 'assets/icons/editor-notes.svg' },
    { title: '', translateWord: 'activeOrder', status: 'active', image: 'assets/icons/active.svg' },
        { title: '', translateWord: 'acknowledgeOrder', status: 'acknowledged', image: 'assets/icons/acknowledge.svg' },
    { title: '', translateWord: 'orderHistory', status: 'completed', image: 'assets/icons/history.svg' }]
    activeTab: string = 'pending';
    queryStatus: string = null;
    orders;
    dtOptions: DataTables.Settings = {};
    processing = false;
    clearing = false;
    deliveryStatus = deliveryStatus;
    customFilterData = {};
    activeFilters = { deliveryStatus: [], paymentMethod: [], amendOrderStatus: [] };
    paymentMethodFilterTypes = [
        { value: paymentModes.CARD, title: '' },
        { value: paymentModes.CASH, title: '' },
        { value: paymentModes.CREDIT, title: '' },
        { value: paymentModes.WALLET, title: '' }
    ];
    setInt: any;
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    subscription: Subscription;


    showTable: boolean = true;
    newTime: number;
    currency = localStorage.getItem('currency');
    selectedLang: string;
    constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal,
        private router: Router, private route: ActivatedRoute, private orderService: OrdersService,
        private spinner: SpinnerService, public languageService: LanguageService, public translate: TranslateService) {
        this.getSelectedLanguage();
        config.placement = 'bottom-right';
        config.autoClose = true;
        configModal.backdrop = 'static';
        configModal.keyboard = false;
    }

    ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
        this.route.queryParams.subscribe(params => {
            if (params['status']) {
                this.queryStatus = 'rejected';
            }
        })
        this.activeTab = (this.route.snapshot.queryParams['tab'] || this.activeTab);
        this.tableOptions();
        this.startTiming();
    }

    /**
     *
     * @param event active tab id
     */
    onNavChange(event) {
        this.activeTab = event.nextId;
        this.queryStatus = null;
        this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tab: this.activeTab } });
        this.orders = [];
        this.customFilterData['status'] = event.nextId;
        this.activeFilters.paymentMethod = [];
        this.activeFilters.deliveryStatus = [];
        this.activeFilters.amendOrderStatus = [];
        this.tableRefresh();
    }


    tableOptions() {
        this.dtOptions = {
            searching: false,
            paging: true,
            pageLength: 20,
            ordering: true,
            order: [],
            lengthChange: false,
            columnDefs: [{ orderable: false, targets: 5, visible: this.activeTab != 'pending' && this.activeTab !== 'acknowledged' },
                { orderable: true, targets: 7, visible: this.activeTab !== 'acknowledged' },
                { orderable: true, targets: 8, visible: this.activeTab == 'acknowledged' }],
            language: {
                paginate: {
                    next: '>',
                    previous: '<',
                    first: '',
                    last: ''
                }
            },
            serverSide: true,
            processing: false,
            scrollY: '35vh',
            scrollX: true,
            columns: [{ data: 'uniqueId', orderable: false, "width": "12px" },
            { data: 'supplierName', orderable: true, "width": "12px" },
            { data: 'restaurantName', orderable: true, "width": "12px" },
            { data: 'createdAt', orderable: true, "width": "10%" },
            { data: 'paymentMethod', orderable: false, "width": "10%" },
            { data: 'deliveryStatus', orderable: false, "width": "12px" },
            { data: 'totalPrice', orderable: true, "width": "12px" },
            { data: 'timer', orderable: true, "width": "12px" },
            { data: 'amendOrderStatus', orderable: false, "width": "12px" }],
            ajax: (dataTablesParameters: any, callback) => {
                this.spinner.start();
                // this.processing = false;
                this.customFilterData['status'] = this.queryStatus ? this.queryStatus : this.activeTab;
                this.customFilterData['deliveryStatus'] = this.activeFilters.deliveryStatus;
                this.customFilterData['amendOrderStatus'] = this.activeFilters.amendOrderStatus;
                this.customFilterData['paymentMethod'] = this.activeFilters.paymentMethod;
                for (let key in this.customFilterData) {
                    dataTablesParameters[key] = this.customFilterData[key];
                }
                this.orderService.getAllOrders(dataTablesParameters).subscribe(resp => {
                    this.showTable = true;
                    this.orders = resp.data;
                    if(dataTablesParameters.deliveryStatus[0] === 'acknowledged'){
                        this.orders = this.orders.filter(el => el.deliveryStatus !== 'rejected');
                    }
                    console.log('data')
                    this.spinner.stop();
                    this.togglePagination();
                    callback({
                        recordsTotal: resp.recordsTotal,
                        recordsFiltered: resp.recordsFiltered,
                        data: []
                    });
                }, error => {
                    this.spinner.stop();
                    this.processing = false;
                });
            }
        };
    }


    checkStatus(status) {
        return this.activeTab.match(status) ? 'active' : '';
    }
    togglePagination() {
        let tabElements = document.getElementsByClassName("dataTables_paginate");
        let tabToDisplay = tabElements.item(0) as HTMLElement;
        if (this.orders.length === 0) {
            tabToDisplay.style.display = "none";
        }
        else {
            tabToDisplay.style.display = "block";
        }
    }

    tableRefresh() {
        this.dtElement.dtInstance.then((dtInstance) => {
            if (this.activeTab !== 'pending') {
                if (this.activeTab !== 'acknowledged') {
                    dtInstance.settings().column(5).visible(true);
                    dtInstance.settings().column(7).visible(true);
                    dtInstance.settings().column(8).visible(false);
                }
                else {
                    dtInstance.settings().column(5).visible(false);
                    dtInstance.settings().column(7).visible(false);
                    dtInstance.settings().column(8).visible(true);
                }
                clearInterval(this.setInt);
            } else {
                dtInstance.settings().column(5).visible(false);
                dtInstance.settings().column(7).visible(true);
                dtInstance.settings().column(8).visible(false);
                this.startTiming();
            }
            dtInstance.ajax.reload();
        });
    }


    tableSetFilter(filterName, value) {
        if (filterName === 'search') {
            this.customFilterData[filterName] = { value, regex: false };
        } else {
            this.customFilterData[filterName] = value;
        }
        this.tableRefresh();
    }

    clearFilter() {
        this.clearing = true;
        setTimeout(() => {
            this.clearing = false;
        }, 200);
        this.customFilterData = {};
        this.tableRefresh();
    }

    navigateTo(item) {
        this.router.navigate([`/orders/view/${item.orderId}`], { queryParams: { sid: item.supplierId } });
    }


    startTiming() {
        if (moment().hour() >= 7 && moment().hour() < 17) {
            this.setInt = setInterval(() => {
                if (moment().hour() < 7 && moment().hour() >= 17) {
                    setTimeout(() => { });
                    clearInterval(this.setInt);
                } else {
                    this.newTime = Date.now();
                }
            }, 60000);
        }
    }

    setFilter(value, isChecked, type) {
        if (isChecked) {
            if (type === 'status') {
                this.activeFilters['deliveryStatus'].push(value);
            } 
            else if (type === 'amendOrderStatus') {
                this.activeFilters['amendOrderStatus'].push(value);
            } else {
                if (value !== 'all') {
                    this.activeFilters.paymentMethod.push(value);
                } else {
                    this.activeFilters.paymentMethod = this.paymentMethodFilterTypes.map(x => x.value);
                }
            }
        } else {
            if (type === 'status') {
                let i = this.activeFilters.deliveryStatus.findIndex(v => v === value);
                this.activeFilters.deliveryStatus.splice(i, 1);
            } else if (type === 'amendOrderStatus') {
                let i = this.activeFilters.amendOrderStatus.findIndex(v => v === value);
                this.activeFilters.amendOrderStatus.splice(i, 1);
            } else {
                if (value !== 'all') {
                    let i = this.activeFilters.paymentMethod.findIndex(v => v === value);
                    this.activeFilters.paymentMethod.splice(i, 1);
                } else {
                    this.activeFilters.paymentMethod = [];
                }

            }
        }
        this.tableRefresh();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        clearInterval(this.setInt);
    }

    getSelectedLanguage() {
        this.subscription = this.languageService.updatedLang$.subscribe((l) => {
            this.translate.use(l)
            for (let i = 0; i < this.links.length; i++) {
                const element = this.links[i];
                this.translate.get(`suppliers.${element.translateWord}`).subscribe((value) => {
                    element.title = value
                })
            }
            for (let i = 0; i < this.paymentMethodFilterTypes.length; i++) {
                const element = this.paymentMethodFilterTypes[i];
                this.translate.get(`${element.value}`).subscribe((value) => {
                    element.title = value
                })
            }
        })
    }
}
