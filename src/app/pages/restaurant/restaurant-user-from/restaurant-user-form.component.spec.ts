import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestaurantUserFormComponent } from './restaurant-user-form.component';

describe('RestaurantUserFormComponent', () => {
  let component: RestaurantUserFormComponent;
  let fixture: ComponentFixture<RestaurantUserFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
