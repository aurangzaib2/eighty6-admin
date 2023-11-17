import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnboardingRejectComponent } from './onboarding-reject.component';

describe('OnboardingRejectComponent', () => {
  let component: OnboardingRejectComponent;
  let fixture: ComponentFixture<OnboardingRejectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingRejectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
