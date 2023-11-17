import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
  selector: 'app-rejected-orders',
  templateUrl: './rejected-orders.component.html',
  styleUrls: ['./rejected-orders.component.scss']
})
export class RejectedOrdersComponent implements OnInit {

  dataList = [];
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(private orderService: OrdersService, private spinner: SpinnerService, public translate: TranslateService, private router: Router) { }

  ngOnInit(): void {
    this.getData();
    this.selectedLang = localStorage.getItem('language');

  }

  getData() {
    this.spinner.start();
    let filter = {
      status: 'rejected',
      length: 20
    }
    this.orderService.getAllOrders(filter).subscribe(result => {
      this.dataList = result.data;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }

  navigateTo() {
    this.router.navigate([`orders`], { queryParams: { tab: 'completed', status: 'rejected' } })
  }
}
