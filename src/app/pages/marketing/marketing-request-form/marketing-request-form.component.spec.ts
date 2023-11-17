import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingRequestFormComponent } from './marketing-request-form.component';

describe('MarketingRequestFormComponent', () => {
  let component: MarketingRequestFormComponent;
  let fixture: ComponentFixture<MarketingRequestFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingRequestFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
