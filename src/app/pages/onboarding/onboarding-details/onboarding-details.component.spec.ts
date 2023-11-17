import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnboardingDetailsComponent } from './onboarding-details.component';

describe('OnboardingDetailsComponent', () => {
  let component: OnboardingDetailsComponent;
  let fixture: ComponentFixture<OnboardingDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
