import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketingAdListComponent } from './marketing-ad-list.component';

describe('MarketingAdListComponent', () => {
  let component: MarketingAdListComponent;
  let fixture: ComponentFixture<MarketingAdListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingAdListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingAdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
