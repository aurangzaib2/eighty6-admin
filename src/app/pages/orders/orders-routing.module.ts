import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderViewComponent } from './order-view/order-view.component';
import { OrdersComponent } from "./orders.component";


const routes: Routes = [
  { path: '', component: OrdersComponent },
  // { path: 'new', component: OrderNewComponent },
  { path: 'view/:id', component: OrderViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
