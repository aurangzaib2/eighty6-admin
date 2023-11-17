import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductManageComponent } from './product-manage.component';

describe('ProductManageComponent', () => {
  let component: ProductManageComponent;
  let fixture: ComponentFixture<ProductManageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
