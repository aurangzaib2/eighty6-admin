import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TranslationListComponent } from './translation-list.component';

describe('TranslationListComponent', () => {
  let component: TranslationListComponent;
  let fixture: ComponentFixture<TranslationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TranslationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
