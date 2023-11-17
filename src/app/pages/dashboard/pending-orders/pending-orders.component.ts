import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../core/services/spinner.service';
import { OrdersService } from '../../../core/services/orders.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-pending-orders',
  templateUrl: './pending-orders.component.html',
  styleUrls: ['./pending-orders.component.scss']
})
export class PendingOrdersComponent implements OnInit, OnDestroy {


  dataList = [];
  setInt: any;
  newTime: number;
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(private orderService: OrdersService, private spinner: SpinnerService, private router: Router , public translate: TranslateService) { }

  ngOnInit(): void {
    this.getData();
    this.selectedLang = localStorage.getItem('language');

  }

  getData() {
    this.spinner.start();
    let filter = {
      status: 'pending',
      length: 20
    }
    this.orderService.getAllOrders(filter).subscribe(result => {
      this.dataList = result.data;
      this.spinner.stop();
      this.startTiming();
    }, error => {
      this.spinner.stop();
    })
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
  navigateToOrder(item) {
    this.router.navigate([`/orders/view/${item.orderId}`], { queryParams: { sid: item.supplierId } });
  }
  ngOnDestroy() {
    clearInterval(this.setInt);
  }
}
