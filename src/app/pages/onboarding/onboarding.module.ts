import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingListComponent } from './onboarding-list/onboarding-list.component';
import { OnboardingDetailsComponent } from './onboarding-details/onboarding-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '../../shared';
import { AgmCoreModule } from '@agm/core';

import { OnboardingRejectComponent } from './onboarding-reject/onboarding-reject.component';
import { environment } from '../../../environments/environment';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [OnboardingListComponent, OnboardingDetailsComponent, OnboardingRejectComponent],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
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
  exports: [
    OnboardingRejectComponent
  ]
})
export class OnboardingModule { }
