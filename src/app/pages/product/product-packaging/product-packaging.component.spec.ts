import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductPackagingComponent } from './product-packaging.component';

describe('ProductPackagingComponent', () => {
  let component: ProductPackagingComponent;
  let fixture: ComponentFixture<ProductPackagingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductPackagingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPackagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
