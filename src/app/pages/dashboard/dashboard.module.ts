import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentDateFormatterHelper } from '../../helpers';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NgCircleProgressModule } from 'ng-circle-progress';

import { SharedModule } from '../../shared';


import { PendingOrdersComponent } from './pending-orders/pending-orders.component';
import { TopRestaurantsComponent } from './top-restaurants/top-restaurants.component';
import { BestSellingProductsComponent } from './best-selling-products/best-selling-products.component';
import { OrderStatsComponent } from './order-stats/order-stats.component';
import { ChartsModule } from 'ng2-charts';
import { DpDatePickerModule } from 'ng2-date-picker';
import { RejectedOrdersComponent } from './rejected-orders/rejected-orders.component';
import { TopCategoriesComponent } from './top-categories/top-categories.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({

  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule,
    ChartsModule,
    DpDatePickerModule,
    // Specify ng-circle-progress as an import
    // NgCircleProgressModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [DashboardComponent, PendingOrdersComponent, TopRestaurantsComponent, BestSellingProductsComponent, OrderStatsComponent, RejectedOrdersComponent, TopCategoriesComponent],
  entryComponents: [],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: NgbDateParserFormatter, useClass: MomentDateFormatterHelper },
    DatePipe
  ]
})

export class DashboardModule {

}
