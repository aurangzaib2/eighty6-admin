import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BestSellingProductsComponent } from './best-selling-products.component';

describe('BestSellingProductsComponent', () => {
  let component: BestSellingProductsComponent;
  let fixture: ComponentFixture<BestSellingProductsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BestSellingProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestSellingProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
