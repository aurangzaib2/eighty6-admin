import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketListComponent } from './market-list.component';

describe('MarketListComponent', () => {
  let component: MarketListComponent;
  let fixture: ComponentFixture<MarketListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
