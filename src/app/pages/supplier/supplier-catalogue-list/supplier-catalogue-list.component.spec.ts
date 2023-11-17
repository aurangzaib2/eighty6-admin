import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierCatalogueListComponent } from './supplier-catalogue-list.component';

describe('SupplierCatalogueListComponent', () => {
  let component: SupplierCatalogueListComponent;
  let fixture: ComponentFixture<SupplierCatalogueListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierCatalogueListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierCatalogueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
