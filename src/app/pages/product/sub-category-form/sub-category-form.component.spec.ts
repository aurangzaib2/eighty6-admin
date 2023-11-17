import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubCategoryFormComponent } from './sub-category-form.component';

describe('SubCategoryFormComponent', () => {
  let component: SubCategoryFormComponent;
  let fixture: ComponentFixture<SubCategoryFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubCategoryFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
