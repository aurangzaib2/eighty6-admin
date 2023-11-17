import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingAdFormComponent } from './marketing-ad-form.component';

describe('MarketingAdFormComponent', () => {
  let component: MarketingAdFormComponent;
  let fixture: ComponentFixture<MarketingAdFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingAdFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingAdFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
