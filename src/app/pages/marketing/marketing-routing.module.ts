import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketingAdListComponent } from './marketing-ad-list/marketing-ad-list.component';
import { MarketingRequestListComponent } from './marketing-request-list/marketing-request-list.component';
import { MarketingVoucherListComponent } from './marketing-voucher-list/marketing-voucher-list.component';
import { MarketingComponent } from './marketing.component';

const routes: Routes = [
  { path: '', redirectTo: 'list/ads', pathMatch: 'full' },
  {
    path: 'list', component: MarketingComponent,
    children: [
      { path: 'ads', component: MarketingAdListComponent },
      { path: 'voucher', component: MarketingVoucherListComponent },
      { path: 'request', component: MarketingRequestListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
