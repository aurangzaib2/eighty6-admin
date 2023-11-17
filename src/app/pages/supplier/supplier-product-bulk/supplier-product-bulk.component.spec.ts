import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierProductBulkComponent } from './supplier-product-bulk.component';

describe('SupplierProductBulkComponent', () => {
  let component: SupplierProductBulkComponent;
  let fixture: ComponentFixture<SupplierProductBulkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierProductBulkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierProductBulkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
