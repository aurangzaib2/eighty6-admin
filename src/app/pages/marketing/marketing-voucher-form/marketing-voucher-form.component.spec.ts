import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingVoucherFormComponent } from './marketing-voucher-form.component';

describe('MarketingVoucherFormComponent', () => {
  let component: MarketingVoucherFormComponent;
  let fixture: ComponentFixture<MarketingVoucherFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingVoucherFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingVoucherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
