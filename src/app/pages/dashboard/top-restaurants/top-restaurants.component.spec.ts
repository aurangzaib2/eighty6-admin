import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TopRestaurantsComponent } from './top-restaurants.component';

describe('TopRestaurantsComponent', () => {
  let component: TopRestaurantsComponent;
  let fixture: ComponentFixture<TopRestaurantsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopRestaurantsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopRestaurantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
