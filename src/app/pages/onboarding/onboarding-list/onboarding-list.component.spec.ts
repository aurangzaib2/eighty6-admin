import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnboardingListComponent } from './onboarding-list.component';

describe('OnboardingListComponent', () => {
  let component: OnboardingListComponent;
  let fixture: ComponentFixture<OnboardingListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
