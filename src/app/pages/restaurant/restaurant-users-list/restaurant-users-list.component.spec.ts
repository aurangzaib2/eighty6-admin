import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RestaurantUsersListComponent } from './restaurant-users-list.component';

describe('RestaurantUsersListComponent', () => {
  let component: RestaurantUsersListComponent;
  let fixture: ComponentFixture<RestaurantUsersListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantUsersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
