import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService, SharedService } from '../../../core';
import { LanguageService } from '../../../core/services/language.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { specialPriceErrors } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';
import * as _ from 'lodash';
import { MarketingService } from '../../../core/services/marketing.service';

@Component({
  selector: 'app-supplier-restaurant',
  templateUrl: './supplier-restaurant.component.html',
  styleUrls: ['./supplier-restaurant.component.scss']
})
export class SupplierRestaurantComponent implements OnInit {

  restaurantsForm = new FormGroup({
    restaurants: new FormControl([], [Validators.minLength(0)])
  });
  restaurantSupplierForm = new FormGroup({
    supplierId: new FormControl(null),
    // restaurantId: new FormControl(null),
    companyId: new FormControl(null),
  });

  selectedRestaurants = [];

  loading: boolean = false;
  submitted: boolean = false;
  displayMessage: string = null;
  minDate = null;
  restaurantList = [];
  companyList = [];
  all = { id: 'all', name: 'Select All', selected: false };
  dropdownSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    allowSearchFilter: true,
    badgeShowLimit: 1,
    labelKey: 'name',
    disabled: false,
    enableSearchFilter: true
  };
  supplierData: any = {};
  errorMessages = specialPriceErrors;
  supplierRestaurants: any = [];
  allSuppliers: [];
  allSuppliersRestaurants: [];
  constructor(private modalService: NgbModal, public route: ActivatedRoute, private router: Router, public translate: TranslateService, public languageService: LanguageService,
    private spinner: SpinnerService, private supplierService: SupplierService, private fb: FormBuilder,
    private toastService: ToastService, private sharedService: SharedService,private marketingService: MarketingService,private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
			this.supplierData = params;
      if (this.supplierData.id) {
        this.getCompanyList();
        this.getRestaurantList();
      }
    });
    this.getSuppliers();
    this.getSupplierRestaurant();

      this.route.queryParams.subscribe(params => {
        if (params['id']) {
          this.restaurantSupplierForm.controls.supplierId.setValue(parseInt(params.id));
        }
      });
  }
  getSuppliers() {
    this.marketingService.getAllSuppliers().subscribe(data => {
      this.allSuppliers = data;
    });
  }
  getSupplierRestaurant() {
    this.supplierService.SupplierRestaurantListing(this.supplierData.id).subscribe(data => {
      this.allSuppliersRestaurants = data;
    });
  }
  get form() {
    return this.restaurantsForm.controls;
  }
  getCompanyList() {
    this.spinner.start();
    this.restaurantService.getCompanyListDropDown().subscribe(data => {
      let restaurants = data.map(element => ({
        id: element.id,
        name: element.name,
      }))
      this.companyList = restaurants;
      this.getSupplierRestaurants();
    }, error => {
      this.spinner.stop();
    })
  }
  getRestaurantList() {
    this.spinner.start();
    this.sharedService.getGlobalRestaurant().subscribe(data => {
      let restaurants = data.map(element => ({
        id: element.id,
        name: element.name,
      }))
      this.restaurantList = restaurants;
      this.getSupplierRestaurants();
    }, error => {
      this.spinner.stop();
    })
  }
  getSupplierRestaurants() {
    this.supplierService.getRestaurants(this.supplierData.id).subscribe(data => {
      this.supplierRestaurants = data;
      this.form.restaurants.setValue(data);
      _.forEach(data, (index) => {
        _.remove(this.restaurantList, (item) => {
          return item.id === index.id;
        });
      });
      this.restaurantList = _.orderBy(this.supplierRestaurants, [element => element.name.toLowerCase()], ['asc']).concat(this.restaurantList);
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  selectCompany(data){
   this.restaurantSupplierForm.controls.companyId.setValue(data?.id);
   this.restaurantSupplierForm.controls.restaurantId.setValue(null);
  }
  selectRestaurant(data){
   this.restaurantSupplierForm.controls.restaurantId.setValue(data?.id);
   this.restaurantSupplierForm.controls.companyId.setValue(null);
  }
  selectSupplier(data){
    this.restaurantSupplierForm.controls.supplierId.setValue(data?.id);
  }
  /**
  * set restaurants
  * @returns 
  */
  onSubmit() {
    this.loading = true;
    this.submitted = true;
    this.displayMessage = null;
    if (!this.restaurantsForm.valid) {
      validateField(this.restaurantsForm);
      this.loading = false;
      return;
    }
    let payload = {
      restaurants: this.form.restaurants.value
    }
    this.supplierService.setRestaurants(payload, this.supplierData.id).subscribe(result => {
      this.loading = false;
      this.toastService.success(result.message);
      this.getRestaurantList();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
  save() {
    this.loading = true;
    this.supplierService.setSupplierRestaurant(this.restaurantSupplierForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result.message);
      
      // this.restaurantSupplierForm.controls.restaurantId.setValue(null);
      this.restaurantSupplierForm.controls.companyId.setValue(null);
      this.getSupplierRestaurant();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
  remove(data) {
    this.loading = true;
    let payload = {
      supplierId: this.supplierData.id,
      companyId: data?.id,
    }
    this.supplierService.deleteSupplierRestaurant(payload).subscribe(result => {
      this.loading = false;
      this.toastService.success(result.message);
      this.getSupplierRestaurant();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
}
