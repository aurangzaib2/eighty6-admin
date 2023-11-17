import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestaurantRoutingModule } from './restaurant-routing.module';
import { RestaurantComponent } from './restaurant.component';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { RestaurantViewComponent } from './restaurant-view/restaurant-view.component';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CompanyListComponent } from './company-list/company-list.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SharedModule } from '../../shared';
import { RestaurantFormComponent } from './restaurant-form/restaurant-form.component';
import { RestaurantInfoComponent } from './restaurant-info/restaurant-info.component';
import { RestaurantUsersListComponent } from './restaurant-users-list/restaurant-users-list.component';
import { RestaurantUserFormComponent } from './restaurant-user-from/restaurant-user-form.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { CompanyFormComponent } from './company-form/company-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    RestaurantComponent,
    RestaurantListComponent,
    RestaurantViewComponent,
    CompanyListComponent,
    RestaurantFormComponent,
    RestaurantInfoComponent,
    RestaurantUsersListComponent,
    RestaurantUserFormComponent,
    CompanyFormComponent
  ],
  imports: [
    CommonModule,
    RestaurantRoutingModule,
    NgbModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    AgmCoreModule.forRoot({
      apiKey: `${environment.GOOGLE_MAP_API_KEY}`,
      libraries: ['places']
    }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
})
export class RestaurantModule { }
