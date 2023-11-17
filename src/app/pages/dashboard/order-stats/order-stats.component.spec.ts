import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrderStatsComponent } from './order-stats.component';

describe('OrderStatsComponent', () => {
  let component: OrderStatsComponent;
  let fixture: ComponentFixture<OrderStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
