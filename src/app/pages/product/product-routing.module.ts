import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ProductDiscountComponent } from './product-discount/product-discount.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductManageComponent } from './product-manage/product-manage.component';
import { ProductRequestComponent } from './product-request/product-request.component';
import { ProductSellerListComponent } from './product-seller-list/product-seller-list.component';
import { ProductTypeComponent } from './product-type/product-type.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { SubCategoryListingComponent } from './sub-category-listing/sub-category-listing.component';

const routes: Routes = [
  { path: '', redirectTo: 'category', pathMatch: 'full' },
  { path: ':id/:name/:nameArabic/sub-category/list', component: SubCategoryListingComponent },
  { path: ':id/:name/:id2/:name2/list', component: ProductListComponent },
  {
    path: '', component: CatalogueComponent,
    children: [
      { path: 'category', component: CategoryListComponent },
      { path: 'request', component: ProductRequestComponent },
      { path: 'manage', component: ProductManageComponent }
    ]
  },
  { path: ':id/:name/:id2/:name2/seller-list', component: ProductSellerListComponent },
  { path: ':id/:name/:id2/:name2/:name3/view', component: ProductViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
