import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierOrderViewComponent } from './supplier-order-view.component';

describe('SupplierOrderViewComponent', () => {
  let component: SupplierOrderViewComponent;
  let fixture: ComponentFixture<SupplierOrderViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierOrderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
