import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierSubCategoryListingComponent } from './supplier-sub-category-listing.component';

describe('SupplierSubCategoryListingComponent', () => {
  let component: SupplierSubCategoryListingComponent;
  let fixture: ComponentFixture<SupplierSubCategoryListingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierSubCategoryListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierSubCategoryListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
