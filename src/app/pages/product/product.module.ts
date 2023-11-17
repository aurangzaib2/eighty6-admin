import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductRequestComponent } from './product-request/product-request.component';
import { ProductDiscountComponent } from './product-discount/product-discount.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ProductRequestFormComponent } from './product-request-form/product-request-form.component';
import { SharedModule } from '../../shared';
import { DataTablesModule } from 'angular-datatables';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductTypeComponent } from './product-type/product-type.component';
import { ProductReceiptComponent } from './product-receipt/product-receipt.component';
import { ProductSellerListComponent } from './product-seller-list/product-seller-list.component';
import { SubCategoryListingComponent } from './sub-category-listing/sub-category-listing.component';
import { SubCategoryFormComponent } from './sub-category-form/sub-category-form.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductUnitsComponent } from './product-units/product-units.component';
import { ProductPackagingComponent } from './product-packaging/product-packaging.component';
import { ProductManageComponent } from './product-manage/product-manage.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [
    ProductComponent,
    CategoryListComponent,
    ProductListComponent,
    ProductRequestComponent,
    ProductDiscountComponent,
    ProductFormComponent,
    ProductRequestFormComponent,
    CatalogueComponent,
    ProductTypeComponent,
    ProductReceiptComponent,
    ProductSellerListComponent,
    SubCategoryListingComponent,
    SubCategoryFormComponent,
    ProductViewComponent,
    ProductUnitsComponent,
    ProductPackagingComponent,
    ProductManageComponent
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    SharedModule,
    DataTablesModule,
    NgSelectModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ]
})
export class ProductModule { }
