import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierRestaurantComponent } from './supplier-restaurant.component';

describe('SupplierRestaurantComponent', () => {
  let component: SupplierRestaurantComponent;
  let fixture: ComponentFixture<SupplierRestaurantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierRestaurantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
