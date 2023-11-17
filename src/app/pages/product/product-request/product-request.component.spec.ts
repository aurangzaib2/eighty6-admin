import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductRequestComponent } from './product-request.component';

describe('ProductRequestComponent', () => {
  let component: ProductRequestComponent;
  let fixture: ComponentFixture<ProductRequestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
