import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductReceiptComponent } from './product-receipt.component';

describe('ProductReceiptComponent', () => {
  let component: ProductReceiptComponent;
  let fixture: ComponentFixture<ProductReceiptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
