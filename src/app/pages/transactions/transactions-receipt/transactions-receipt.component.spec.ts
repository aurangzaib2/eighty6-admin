import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransactionsReceiptComponent } from './transactions-receipt.component';

describe('TransactionsReceiptComponent', () => {
  let component: TransactionsReceiptComponent;
  let fixture: ComponentFixture<TransactionsReceiptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
