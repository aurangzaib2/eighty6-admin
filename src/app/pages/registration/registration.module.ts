import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationListComponent } from './registration-list/registration-list.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';
import { environment } from '../../../environments/environment';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}



@NgModule({
  declarations: [
    RegistrationListComponent,
    RegistrationFormComponent
  ],
  imports: [
    CommonModule,
    RegistrationRoutingModule,
    NgbModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OnboardingModule,
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
  ]
})
export class RegistrationModule { }
