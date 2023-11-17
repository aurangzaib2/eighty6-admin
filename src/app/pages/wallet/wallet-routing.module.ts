import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletsListComponent } from './wallets-list/wallets-list.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: WalletsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
