import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketListComponent } from './market-list/market-list.component';
import { SpecialPriceComponent } from './special-price/special-price.component';
import { SupplierCatalogueListComponent } from './supplier-catalogue-list/supplier-catalogue-list.component';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { SupplierInfoComponent } from './supplier-info/supplier-info.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierOrderListComponent } from './supplier-order-list/supplier-order-list.component';
import { SupplierOrderViewComponent } from './supplier-order-view/supplier-order-view.component';
import { SupplierProductListComponent } from './supplier-product-list/supplier-product-list.component';
import { SupplierRestaurantComponent } from './supplier-restaurant/supplier-restaurant.component';
import { SupplierSubCategoryListingComponent } from './supplier-sub-category-listing/supplier-sub-category-listing.component';
import { SupplierViewComponent } from './supplier-view/supplier-view.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: SupplierListComponent },
  {
    path: '', component: SupplierViewComponent,
    children: [
      { path: 'info', component: SupplierInfoComponent },
      { path: 'catalogue', component: SupplierCatalogueListComponent },
      { path: 'catalogue/:id/:name/:id2/:name2/p', component: SupplierProductListComponent },
      { path: 'catalogue/:id/:name/sub-category/list', component: SupplierSubCategoryListingComponent },
      { path: 'order/list', component: SupplierOrderListComponent },
      {
        path: 'order/market-list', component: MarketListComponent,
        children: [
          { path: 'special-price', component: SpecialPriceComponent },
          { path: 'restaurants', component: SupplierRestaurantComponent },
        ]
      },
    ]
  },
  { path: 'details', component: SupplierFormComponent },
  { path: ':name/:id/order', component: SupplierOrderViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
