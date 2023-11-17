import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyFormComponent } from './company-form/company-form.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { RestaurantFormComponent } from './restaurant-form/restaurant-form.component';
import { RestaurantInfoComponent } from './restaurant-info/restaurant-info.component';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { RestaurantUsersListComponent } from './restaurant-users-list/restaurant-users-list.component';
import { RestaurantViewComponent } from './restaurant-view/restaurant-view.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: CompanyListComponent },
  { path: 'view', component: CompanyFormComponent },
  { path: 'restaurant/list', component: RestaurantListComponent },
  {
    path: ':name/restaurant', component: RestaurantViewComponent,
    children: [
      { path: 'info', component: RestaurantInfoComponent },
      { path: 'users', component: RestaurantUsersListComponent },
    ]
  },
  { path: 'restaurant/details', component: RestaurantFormComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
