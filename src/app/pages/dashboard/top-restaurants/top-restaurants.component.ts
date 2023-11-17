import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { MetadataService } from '../../../core/services/metadata.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-top-restaurants',
  templateUrl: './top-restaurants.component.html',
  styleUrls: ['./top-restaurants.component.css']
})
export class TopRestaurantsComponent implements OnInit {

  restaurantList = [];
  supplierList = [];
  activeTab = 1;
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(private metadataService: MetadataService, private spinner: SpinnerService, private router:Router , public translate: TranslateService) { }

  ngOnInit(): void {
    this.getRestaurant();
    this.selectedLang = localStorage.getItem('language');

  }

  getRestaurant() {
    this.spinner.start();
    this.metadataService.getTopRestaurantList().subscribe(result => {
      this.restaurantList = result;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }
  getSuppliers() {
    this.spinner.start();
    this.metadataService.getTopSuppliersList().subscribe(result => {
      this.supplierList = result;
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }
  navigateToRestaurantView(item) {
    this.router.navigate([`/company/${item.name}/restaurant/info`], { queryParams: { id: item.id } });
  }
  navigateToSupplierView(item) {
    this.router.navigate([`/supplier/catalogue`], { queryParams: { id: item.id, sn: item.name } });
  }
}
