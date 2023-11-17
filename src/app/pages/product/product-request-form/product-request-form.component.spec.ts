import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductRequestFormComponent } from './product-request-form.component';

describe('ProductRequestFormComponent', () => {
  let component: ProductRequestFormComponent;
  let fixture: ComponentFixture<ProductRequestFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductRequestFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
