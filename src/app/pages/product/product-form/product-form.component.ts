import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from '../../../core';
import { OPTIONS, productFormErrors } from '../../../helpers/constants.helper';
import { MetadataService } from '../../../core/services/metadata.service';
import { ProductService } from '../../../core/services/product.service';
import { validateField } from '../../../shared/validators/form.validator';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [NgbTooltipConfig] // add NgbTooltipConfig to the component providers
})
export class ProductFormComponent implements OnInit {

  productForm = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(''),
    displayName: new FormControl(''),
    categoryId: new FormControl(null, [Validators.required]),
    subCategoryId: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    brandName: new FormControl(''),
    origin: new FormControl(''),
    quantity: new FormControl('', [Validators.required]),
    productType: new FormControl([]),
    packagingId: new FormControl(''),
    unitId: new FormControl('', [Validators.required]),
    displayNameArabic: new FormControl(''),
  });
  productType = this.productForm.get('productType') as FormControl;
  errorMessages = productFormErrors;
  loading: boolean = false;
  displayMessage: string = null;
  categoryList = [];
  subCategoryList = [];
  unitsList: [];
  countryList = [];
  typeList = [];
  packagingList = [];
  fileUploaded: boolean = false;
  fileInfo: any = {};
  @Input() productData: any = { id: null };
  @Input() catId: any ;
  @Input() subCatId: any ;
  @Input() type: any ;
  selectedLang: string;
  token: any;
  constructor(public modalService: NgbModal, private productService: ProductService, config: NgbTooltipConfig,
    private activeModal: NgbActiveModal, private uploadService: UploadService, private metadataService: MetadataService,
    private toastService: ToastService, private spinner: SpinnerService, public translate: TranslateService) {
    // customize default values of tooltips used by this component tree
    config.placement = 'bottom-left';
    config.autoClose = true;
  }

  get form() {
    return this.productForm.controls;
  }
  ngOnInit(): void {
    this.getAllCategory();
    this.getMetadata();
    this.selectedLang = localStorage.getItem('language');

  }

  getAllCategory() {
    this.spinner.start();
    this.productService.getGlobalCategories().subscribe(result => {
      this.categoryList = result;
      if (this.type == 'edit') {
        this.productForm.controls.categoryId.setValue(Number(this.productData.categoryId));
        this.resetSubCategory(Number(this.productData.categoryId))
      }else{
        this.productForm.controls.categoryId.setValue(Number(this.catId));
        this.resetSubCategory(Number(this.catId))
      }
     
     // this.getSubCategory(Number(this.catId))

    }, error => {
      this.spinner.stop();
      ;
    })
  }
  resetSubCategory(id) {
    if (id) {
      this.getSubCategory(id);
    }
    // else{
    //   this.getSubCategory('');
    // }
    
  }
  getSubCategory(id) {
    this.spinner.start();
    this.productService.getGlobalSubCategories({ parentId: id }).subscribe(result => {
      this.subCategoryList = result;
      if (this.subCategoryList.find((x) => x.id === this.productData.subCategoryId)) {
        this.form.subCategoryId.setValue(this.productData.subCategoryId);
        
      }
      else {
        // this.form.subCategoryId.setValue(this.subCategoryList[0].id);
      this.productForm.controls.subCategoryId.setValue(Number(this.subCatId));

      }
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  getMetadata() {
    this.metadataService.getMetaData().subscribe(result => {
      this.countryList = result.countries;
      this.typeList = result.productType;
      this.unitsList = result.units;
      this.packagingList = result.packaging;
      if (this.productData.id) {
        this.productForm.patchValue(this.productData);
        this.form.categoryId.setValue(parseInt(this.productData.categoryId))
        this.form.subCategoryId.setValue(parseInt(this.productData.subCategoryId))
    this.productForm.controls.displayNameArabic.setValue(this.productData.nameTranslation.ar);
    // if (this.productData.nameTranslation.en) {
    // this.productForm.controls.displayName.setValue(this.productData.nameTranslation.en);
    // }else{
    this.productForm.controls.displayName.setValue(this.productData.displayName);

    // }

        if (this.productData.productType) {
          this.productForm.controls.productType.setValue(this.productData.productType.map(element => element.id));
        }
        // this.getSubCategory(this.productData.categoryId);
        this.fileInfo.image = this.productData.image
        this.fileUploaded = this.fileInfo.image ? true : false;
      }
      this.spinner.stop();
    }, error => {
      ;
      this.spinner.stop();
    })
  }
  selectType(value) {
    this.productType.value.push(value);
  }
  onRemove(value) {

  }
  uploadImage(event) {
    let file = event;
    const Img = new Image();
    Img.src = URL.createObjectURL(file);

    Img.onload = (e: any) => {
      const height = e.path[0].height;
      const width = e.path[0].width;
      if (this.uploadService.checkHeightWidth(width, height)) {
        this.displayMessage = OPTIONS.dimension;
        return;
      }
    }
    if (this.uploadService.checkImageType(file)) {
      this.displayMessage = OPTIONS.imageType;
      return;
    }
    if (this.uploadService.checkFileSize(file)) {
      this.displayMessage = OPTIONS.sizeLimit;
      return;
    }
    this.spinner.start();
    let formData = new FormData();
    formData.append('file', file);
    this.uploadService.fileCheck(formData).subscribe(result => {
      this.loading = false;
      this.token = result.token;
      if (result.status == true) {
    this.uploadService.uploadFile(formData,this.token).subscribe(result => {
      let obj = result.result;
      this.form.image.setValue(obj.data.key);
      this.fileInfo = obj.data;
      this.fileInfo.image = obj.cdn;
      this.fileInfo.originalSize = (this.fileInfo.size / 1024).toFixed(0)
      this.fileUploaded = true;
      this.displayMessage = null;
      this.spinner.stop();
    }, error => {
      ;
      this.toastService.error(error);
      this.spinner.stop();
    })
  }
}, error => {
  this.loading = false;
  this.displayMessage = error;
});

}
  clearImage() {
    this.fileUploaded = false;
    this.form.image.setValue('');
  }
  /**
   * create a new product for inventory
   */
  onSubmit() {
    this.loading = true;
    if (this.productForm.invalid) {
      validateField(this.productForm);
      this.loading = false;
      return;
    }
  
    if (this.form.id.value === null) {
      let displayNameTranslation = {
        en: this.productForm.value.displayName,
        ar: this.productForm.value.displayNameArabic,
      }
    if (!this.productForm.value.displayName && !this.productForm.value.displayNameArabic) {
      this.displayMessage = 'Enter English Product Name or Arabic Product Name';
     this.toastService.error('Enter English Product Name or Arabic Product Name');
     this.loading = false
     return; 
    }
 
    // this.productForm.removeControl('displayNameArabic');
    let data = this.productForm.value;
    data.displayNameTranslation = displayNameTranslation;
      this.productService.createProduct(data).subscribe(result => {
        this.loading = false;
        this.toastService.success(result);
        this.dismissModal();
      }, error => {
        this.loading = false;
        ;
        this.displayMessage = error;
      })
    }
    else {
      this.updateProduct();
    }
  }
  updateProduct() {
    if (!this.productForm.value.displayName && !this.productForm.value.displayNameArabic) {
      this.displayMessage = 'Enter English Product Name or Arabic Product Name'
     this.toastService.error('Enter English Product Name or Arabic Product Name');
     this.loading = false
     return; 
    }
    let displayNameTranslation = {
      en: this.productForm.value.displayName,
      ar: this.productForm.value.displayNameArabic,
    }
   
    if (!this.productForm.value.displayName) {
      this.productForm.controls.displayName.setValue(this.productForm.value.displayNameArabic);
    }
    this.productForm.removeControl('displayNameArabic');

    let data = this.productForm.value;
    data.displayNameTranslation = displayNameTranslation; 
    this.productService.updateProduct(data).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      ;
      this.displayMessage = error;
    })
  }
  /**
   * dismiss modal
   */
  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
  }

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
      this.uploadImage(files[0]);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }
}
