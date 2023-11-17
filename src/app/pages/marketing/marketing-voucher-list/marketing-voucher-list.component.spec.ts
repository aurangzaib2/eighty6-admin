import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingVoucherListComponent } from './marketing-voucher-list.component';

describe('MarketingVoucherListComponent', () => {
  let component: MarketingVoucherListComponent;
  let fixture: ComponentFixture<MarketingVoucherListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingVoucherListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingVoucherListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
