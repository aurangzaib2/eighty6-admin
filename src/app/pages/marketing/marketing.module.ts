import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketingRoutingModule } from './marketing-routing.module';
import { MarketingComponent } from './marketing.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { MarketingAdListComponent } from './marketing-ad-list/marketing-ad-list.component';
import { MarketingVoucherListComponent } from './marketing-voucher-list/marketing-voucher-list.component';
import { MarketingVoucherFormComponent } from './marketing-voucher-form/marketing-voucher-form.component';
import { MarketingAdFormComponent } from './marketing-ad-form/marketing-ad-form.component';
import { MarketingRequestFormComponent } from './marketing-request-form/marketing-request-form.component';
import { MarketingRequestListComponent } from './marketing-request-list/marketing-request-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { SharedModule } from '../../shared';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [
    MarketingComponent,
    MarketingAdListComponent,
    MarketingAdFormComponent,
    MarketingVoucherListComponent,
    MarketingVoucherFormComponent,
    MarketingRequestFormComponent,
    MarketingRequestListComponent
  ],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    NgbModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
export class MarketingModule { }
