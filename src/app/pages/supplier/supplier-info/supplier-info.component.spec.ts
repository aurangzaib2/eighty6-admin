import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierInfoComponent } from './supplier-info.component';

describe('SupplierInfoComponent', () => {
  let component: SupplierInfoComponent;
  let fixture: ComponentFixture<SupplierInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
