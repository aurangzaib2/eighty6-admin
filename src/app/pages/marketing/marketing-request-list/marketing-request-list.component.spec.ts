import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingRequestListComponent } from './marketing-request-list.component';

describe('MarketingRequestListComponent', () => {
  let component: MarketingRequestListComponent;
  let fixture: ComponentFixture<MarketingRequestListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingRequestListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
