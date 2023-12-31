import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestaurantViewComponent } from './restaurant-view.component';

describe('RestaurantViewComponent', () => {
  let component: RestaurantViewComponent;
  let fixture: ComponentFixture<RestaurantViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
