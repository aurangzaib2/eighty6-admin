import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { DataTablesModule } from 'angular-datatables';
import { TicketListComponent } from './ticket-list/ticket-list.component';
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
  declarations: [TicketListComponent,TicketViewComponent, TicketFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TicketsRoutingModule,
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
export class TicketsModule { }
