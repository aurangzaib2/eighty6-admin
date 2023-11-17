import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierProductFormComponent } from './supplier-product-form.component';

describe('SupplierProductFormComponent', () => {
  let component: SupplierProductFormComponent;
  let fixture: ComponentFixture<SupplierProductFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierProductFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
