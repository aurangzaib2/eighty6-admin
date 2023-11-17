import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductUnitsComponent } from './product-units.component';

describe('ProductUnitsComponent', () => {
  let component: ProductUnitsComponent;
  let fixture: ComponentFixture<ProductUnitsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
