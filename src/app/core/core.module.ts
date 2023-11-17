import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpTokenInterceptor} from './interceptors';

import {
  ApiService,
  AuthGuard,
  JwtService,
  UserService,
  WalletService,
  CardService
} from './services';
import {UploadService} from "./services";
import {SweetAlertService} from "./services/sweet-alert.service";
import { TranslationService } from './services/translation.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true},
    ApiService,
    AuthGuard,
    JwtService,
    UserService,
    WalletService,
    CardService,
    UploadService,
    SweetAlertService,
    TranslationService
  ],
  declarations: []
})
export class CoreModule {}
