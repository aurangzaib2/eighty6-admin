import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplierRoutingModule } from './supplier-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '../../shared';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierProductListComponent } from './supplier-product-list/supplier-product-list.component';
import { SupplierProductFormComponent } from './supplier-product-form/supplier-product-form.component';
import { SupplierProductBulkComponent } from './supplier-product-bulk/supplier-product-bulk.component';
import { SupplierOrderListComponent } from './supplier-order-list/supplier-order-list.component';
import { SupplierOrderViewComponent } from './supplier-order-view/supplier-order-view.component';
import { SupplierCatalogueListComponent } from './supplier-catalogue-list/supplier-catalogue-list.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../../environments/environment';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { SupplierInfoComponent } from './supplier-info/supplier-info.component';
import { SupplierViewComponent } from './supplier-view/supplier-view.component';
import { SupplierSubCategoryListingComponent } from './supplier-sub-category-listing/supplier-sub-category-listing.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SpecialPriceComponent } from './special-price/special-price.component';
import { SpecialPriceFormComponent } from './special-price-form/special-price-form.component';
import { MarketListComponent } from './market-list/market-list.component';
import { SupplierRestaurantComponent } from './supplier-restaurant/supplier-restaurant.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}



@NgModule({
  declarations: [
    SupplierListComponent,
    SupplierCatalogueListComponent,
    SupplierViewComponent,
    SupplierInfoComponent,
    SupplierFormComponent,
    SupplierProductListComponent,
    SupplierProductFormComponent,
    SupplierProductBulkComponent,
    SupplierOrderListComponent,
    SupplierOrderViewComponent,
    SupplierSubCategoryListingComponent,
    SpecialPriceComponent,
    SpecialPriceFormComponent,
    MarketListComponent,
    SupplierRestaurantComponent
  ],
  imports: [
    CommonModule,
    SupplierRoutingModule,
    NgbModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    AngularMultiSelectModule,
    AgmCoreModule.forRoot({
      apiKey: `${environment.GOOGLE_MAP_API_KEY}`
    }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
   // NgxDatatableModule,
  ]
})
export class SupplierModule { }
