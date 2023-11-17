import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PendingOrdersComponent } from './pending-orders.component';

describe('PendingOrdersComponent', () => {
  let component: PendingOrdersComponent;
  let fixture: ComponentFixture<PendingOrdersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
