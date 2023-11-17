import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormErrorsComponent } from './errors/form-errors.component';
import { AlertModalComponent } from './modals/alert-modal';
import { InnerHeaderComponent } from './inner-header';
import { RangeDatepickerComponent } from "./range-datepicker";
import { NumbersOnlyInputDirective } from "../directives/numbersOnlyInput.directive";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CapitalizePipe, Timer, TruncatePipe, SearchPipe, SortPipe} from './pipes';
import { VerificationAutoTabDirective } from '../directives/auto-focus.directive';
import { DragDropDirective } from '../directives/drag-drop.directive';
import { InputIntegerDirective } from '../directives/inputInteger.directive';
import { QuillModule } from 'ngx-quill';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


const DIRECTIVES = [
  DragDropDirective,
  InputIntegerDirective,
  VerificationAutoTabDirective
]

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    AngularMultiSelectModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    FormErrorsComponent,
    AlertModalComponent,
    RangeDatepickerComponent,
    NumbersOnlyInputDirective,
    InnerHeaderComponent,
    Timer,
    TruncatePipe,
    CapitalizePipe,
    SearchPipe,
    SortPipe,
    ...DIRECTIVES
  ],
  exports: [
    AngularMultiSelectModule,
    InnerHeaderComponent,
    FormErrorsComponent,
    AlertModalComponent,
    RangeDatepickerComponent,
    NumbersOnlyInputDirective,
    Timer,
    TruncatePipe,
    CapitalizePipe,
    SearchPipe,
    SortPipe,
    ...DIRECTIVES
  ]
})
export class SharedModule {
}
