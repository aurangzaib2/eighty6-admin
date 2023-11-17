import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSellerListComponent } from './product-seller-list.component';

describe('ProductSellerListComponent', () => {
  let component: ProductSellerListComponent;
  let fixture: ComponentFixture<ProductSellerListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSellerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSellerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
