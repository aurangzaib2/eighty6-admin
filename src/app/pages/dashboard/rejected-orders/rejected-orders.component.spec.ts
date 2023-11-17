import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectedOrdersComponent } from './rejected-orders.component';

describe('RejectedOrdersComponent', () => {
  let component: RejectedOrdersComponent;
  let fixture: ComponentFixture<RejectedOrdersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectedOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
