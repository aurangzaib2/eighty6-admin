import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomeModule } from './pages/home/home.module';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from './core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {
  HeaderComponent,
  SharedModule,
  SidebarComponent,
} from './shared';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { P404Component } from './pages/p404/p404.component';
import { DefaultComponent } from './pages/container/default/default.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password';
import { LoginComponent } from './pages/auth/login';
import { ResetPasswordComponent } from './pages/auth/reset-password';
import { SignUpComponent } from './pages/auth/sign-up';
import { VerificationComponent } from './pages/auth/verification/verification.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './shared/toast/toast.component';
import { LoadingComponent } from './shared/loading/loading.component';
import { CategoryFormComponent } from './pages/product/category-form/category-form.component';
import { TransactionsReceiptComponent } from './pages/transactions/transactions-receipt/transactions-receipt.component';
import { GlobalErrorHandler } from './core/error-handlers/global-error.handler ';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const AUTH = [
  LoginComponent,
  SignUpComponent,
  ForgotPasswordComponent,
  ResetPasswordComponent,
  VerificationComponent,
];

const LAYOUTS = [
  HeaderComponent,
  SidebarComponent
];

@NgModule({
  declarations: [
    AppComponent,
    ...AUTH,
    ...LAYOUTS,
    P404Component,
    DefaultComponent,
    ToastComponent,
    LoadingComponent,
    CategoryFormComponent,
    TransactionsReceiptComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    HomeModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
