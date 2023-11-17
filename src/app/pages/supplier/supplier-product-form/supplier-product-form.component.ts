import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbActiveModal, NgbNavConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../core';
import { MetadataService } from '../../../core/services/metadata.service';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { productFormErrors } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-supplier-product-form',
  templateUrl: './supplier-product-form.component.html',
  styleUrls: ['./supplier-product-form.component.scss']
})
export class SupplierProductFormComponent implements OnInit {

  @Input() productData: any = {
    name: ''
  };
  productForm = new FormGroup({
    id: new FormControl(null),
    supplierId: new FormControl(),
    name: new FormControl(''),
    subProduct: new FormControl(''),
    categoryId: new FormControl('', [Validators.required]),
    subCategoryId: new FormControl('', [Validators.required]),
    productId: new FormControl('', [Validators.required]),
    productCode: new FormControl(''),
    price: new FormControl('', [Validators.required, Validators.pattern('[0-9]+?(\.[0-9][0-9]?)?')]),
    discountedPrice: new FormControl(0),
    discountedPercentage: new FormControl(0, [Validators.pattern('[0-9]+?(\.[0-9][0-9]?)?')]),
    description: new FormControl(''),
    displayName: new FormControl(''),
    displayNameArabic: new FormControl(''),
    packagingId: new FormControl(''),
    unitId: new FormControl(''),
    brandName: new FormControl(''),
    origin: new FormControl(''),
    productType: new FormControl([]),
  });
  errorMessages = productFormErrors;
  loading: boolean = false;
  displayMessage: string = null;
  categoryList = [];
  subCategoryList = [];
  subProduct = [];
  brandList = [];
  unitsList: [];
  originList = [];
  typeList = [];
  packagingList = [];
  productList = [];
  productType = this.productForm.get('productType') as FormControl;
  productSelected: any = {
    name: null, id: null, image: null
  };
  activeTab = 1;
  supplierId: number = null;
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private productService: ProductService, private metadataService: MetadataService,
    private userService: UserService, config: NgbNavConfig, private toastService: ToastService, private spinner: SpinnerService, private supplierService: SupplierService,
    private changeDetaction: ChangeDetectorRef, public translate: TranslateService,
    private route: ActivatedRoute) {
    // customize default values of navs used by this component tree
    config.destroyOnHide = false;
    config.roles = false;
  }

  get form() {
    return this.productForm.controls;
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    this.route.queryParams.subscribe(params => {
      this.supplierId = params['id']
    });
    this.form.supplierId.setValue(this.supplierId);
    this.getAllCategory();
  }
  checkPrice() {
    return parseInt(this.form.discountedPrice.value) > parseInt(this.form.price.value) ? true : false;
  }
  checkDiscountedPercentage() {
    return parseInt(this.form.discountedPercentage.value) > 100 ? true : false;
  }
  calculateDiscountPercentage() {
    if (this.form.discountedPrice.value > 0) {
      let value = (((this.form.price.value - this.form.discountedPrice.value) / this.form.price.value) * 100);
      let newValue = Math.round(value);
      this.form.discountedPercentage.setValue(newValue > 0 ? newValue : '');
    }
    else {
      this.form.discountedPercentage.setValue(0);
      // this.form.discountedPrice.setValue(0);
    }
  }
  calculateDiscountPrice() {
    if (this.form.price.value != '' || this.form.price.value != null) {
      if (this.form.discountedPercentage.value > 0) {
        let value = ((100 - this.form.discountedPercentage.value) * this.form.price.value / 100).toFixed(2);
        let newValue = (value) === (this.form.price.value) ? 0 : (value);
        this.form.discountedPrice.setValue(newValue > 0 ? newValue : 0);
      }
      else {
        this.form.discountedPrice.setValue(0);
      }
    }
  }
  clearProduct() {
    this.productList = [];
  }

  getAllCategory() {
    this.spinner.start();
    this.productService.getGlobalCategories().subscribe(result => {
      this.categoryList = result;
      if (this.productData.name != '') {
        this.productForm.patchValue(this.productData);
        this.form.productCode.setValue(this.productData.sku)
        this.calculateDiscountPercentage();
        this.form.name.setValue(this.productData.product.name);
        this.form.productCode.setValue(this.productData.product.sku);
        this.form.displayName.setValue(this.productData.product.displayName);
        this.form.displayNameArabic.setValue(this.productData.product.displayNameTranslation?.ar);
        this.form.subProduct.setValue(this.productData.product.name);
        this.form.brandName.setValue(this.productData.product.brandName);
        this.form.origin.setValue(this.productData.product.origin);
        this.productForm.controls.productType.setValue(this.productData.product.productType.map(element => ({
          id: element.id,
          name: element.name
        })));
        this.form.packagingId.setValue(this.productData.product.packagingId);
        this.form.unitId.setValue(this.productData.product.unitId);
        this.productSelected = this.productData;
        this.getSubCategory();
        this.getSubProduct();
        this.getBrands();
        this.getOrigins();
        this.getTypes();
        this.getPackages();
        this.getQuantitySize();
        this.changeDetaction.detectChanges();
      }
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  getSubCategory() {
    this.spinner.start();
    this.supplierService.getProductSubCategory({ categoryId: this.form.categoryId.value }).subscribe(result => {
      this.subCategoryList = result;
      if (this.productData.name === '') {
        this.productSelected = {};
        this.subProduct = [];
        this.brandList = [];
        this.originList = [];
        this.typeList = [];
        this.packagingList = [];
        this.productList = [];
        this.form.subCategoryId.reset();
        this.form.subProduct.reset();
        this.form.brandName.reset();
        this.form.origin.reset();
        this.form.productType.reset();
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
      }
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  getSubProduct() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
    }
    this.spinner.start();
    this.supplierService.getSubProduct(params).subscribe(result => {
      this.subProduct = result;
      if (this.productData.name === '') {
        this.form.subProduct.reset();
        this.form.brandName.reset();
        this.form.origin.reset();
        this.form.productType.reset();
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.productSelected = {};
        this.brandList = [];
        this.originList = [];
        this.typeList = [];
        this.packagingList = [];
        this.productList = [];
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  getBrands() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
      subProduct: this.form.subProduct.value ? this.form.subProduct.value : 'Any',
    }
    this.spinner.start();
    this.supplierService.getBrandNames(params).subscribe(result => {
      this.brandList = result;
      if (this.productData.name === '') {
        this.form.brandName.reset();
        this.form.origin.reset();
        this.form.productType.reset();
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.productSelected = {};
        this.originList = [];
        this.typeList = [];
        this.packagingList = [];
        this.productList = [];
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getOrigins() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
      subProduct: this.form.subProduct.value ? this.form.subProduct.value : 'Any',
      brandName: this.form.brandName.value ? this.form.brandName.value : 'Any'
    }
    this.spinner.start();
    this.supplierService.getOrigin(params).subscribe(result => {
      this.originList = result;
      if (this.productData.name === '') {
        this.form.origin.reset();
        this.form.productType.reset();
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.packagingList = [];
        this.productList = [];
        this.typeList = [];
        this.productSelected = {};
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  getTypes() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
      subProduct: this.form.subProduct.value ? this.form.subProduct.value : 'Any',
      brandName: this.form.brandName.value ? this.form.brandName.value : 'Any',
      origin: this.form.origin.value ? this.form.origin.value : 'Any'
    }
    this.spinner.start();
    this.supplierService.getTypes(params).subscribe(result => {
      this.typeList = result;
      if (this.productData.name === '') {
        this.form.productType.reset();
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.productSelected = {};
        this.packagingList = [];
        this.productList = [];
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getPackages() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
      subProduct: this.form.subProduct.value ? this.form.subProduct.value : 'Any',
      brandName: this.form.brandName.value ? this.form.brandName.value : 'Any',
      origin: this.form.origin.value ? this.form.origin.value : 'Any',
      productType: JSON.stringify(this.form.productType.value),
    }
    this.spinner.start();
    this.supplierService.getPackaging(params).subscribe(result => {
      this.packagingList = result;
      if (this.productData.name === '') {
        this.form.packagingId.reset();
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.productList = [];
        this.productSelected = {};
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  getQuantitySize() {
    let params = {
      categoryId: this.form.categoryId.value,
      subCategoryId: this.form.subCategoryId.value,
      subProduct: this.form.subProduct.value ? this.form.subProduct.value : 'Any',
      brandName: this.form.brandName.value ? this.form.brandName.value : 'Any',
      origin: this.form.origin.value ? this.form.origin.value : 'Any',
      productType: JSON.stringify(this.form.productType.value),
      packagingId: this.form.packagingId.value ? this.form.packagingId.value : 'Any',
    }
    this.spinner.start();
    this.supplierService.getQuantitySize(params).subscribe(result => {
      this.productList = result;
      if (this.productData.name === '') {
        this.form.unitId.reset();
        this.form.productId.reset();
        this.form.name.reset();
        this.form.productCode.reset();
        this.form.displayName.reset();
        this.form.displayNameArabic.reset();
        this.productSelected = {};
      } this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }
  selectProduct() {
    let product = this.productList.find(p => p.id === this.form.productId.value);
    this.productSelected = product;
    this.form.unitId.setValue(product.name);
    this.form.name.setValue(product.unitId);
    this.form.productCode.setValue(product.sku);
    this.form.displayName.setValue(product.displayName);
    this.form.displayNameArabic.setValue(product.displayNameTranslation?.ar);
    this.changeDetaction.detectChanges();
  }
  /**
   * create a new product for inventory
   */
  onSubmit() {
    this.loading = true;
    this.displayMessage = null;
    if (this.productForm.invalid) {
      validateField(this.productForm);
      this.loading = false;
      return;
    }
    if (this.form.discountedPercentage.value === '' || this.form.discountedPercentage.value === null) {
      this.form.discountedPercentage.setValue(0);
      this.form.discountedPrice.setValue(0);
    }
    if (this.checkPrice() || this.checkDiscountedPercentage()) {
      this.loading = false;
      return;
    }
    if (this.form.id.value === null) {
      this.supplierService.createProduct(this.productForm.value).subscribe(result => {
        this.loading = false;
        this.toastService.success(result);
        this.dismissModal();
      }, error => {
        this.loading = false;
        // ;
        this.displayMessage = error;
      })
    }
    else {
      this.updateProduct();
    }
  }
  updateProduct() {
    this.supplierService.updateProduct(this.productForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      // ;
      this.displayMessage = error;
    })
  }
  /**
   * dismiss modal
   */
  dismissModal() {
    this.modalService.dismissAll('dismiss modal');
  }
  /**
   * close modal
   */
  closeModal() {
    this.activeModal.close('close modal');
  }
}
