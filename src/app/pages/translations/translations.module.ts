import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslationRoutingModule } from './translations-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { TranslationListComponent } from './translation-list/translation-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TruncatePipe } from '../../shared/pipes';
import { SharedModule } from '../../shared';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}



@NgModule({
  declarations: [TranslationListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslationRoutingModule,
    SharedModule,
    NgbModule,
    DataTablesModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ]
})
export class TranslationModule { }
