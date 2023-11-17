import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../core';
import { ProductService } from '../../../core/services/product.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { categoryFormErrors, OPTIONS, subCategoryFormErrors } from '../../../helpers';
import { validateField } from '../../../shared/validators/form.validator';

@Component({
  selector: 'app-sub-category-form',
  templateUrl: './sub-category-form.component.html',
  styleUrls: ['./sub-category-form.component.scss']
})
export class SubCategoryFormComponent implements OnInit {

  @Input() data: any = {};
  @Input() catID: any = {};
  categoryForm = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    Aname: new FormControl('', [Validators.required]),
    parentId: new FormControl('', [Validators.required]),
    image: new FormControl(null),
  });
  loading: boolean = false;
  displayMessage: string = null;
  errorMessages = subCategoryFormErrors;
  fileUploaded: boolean = false;
  fileInfo: any = {};
  categoryList = [];
  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private productService: ProductService,
    private uploadService: UploadService, private toastService: ToastService, private spinner: SpinnerService , public translate: TranslateService) { }

  get form() {
    return this.categoryForm.controls;
  }
  ngOnInit(): void {
    this.getAllCategory();
  }

  getAllCategory() {
    this.spinner.start();
    this.productService.getGlobalCategories().subscribe(result => {
      this.categoryList = result;
      this.categoryForm.controls.parentId.setValue(Number(this.catID));
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    })
  }
  /**
   * add new category
   * @returns 
   */
  onSubmit() {
    this.loading = true;
    if (this.categoryForm.invalid) {
      validateField(this.categoryForm);
      this.loading = false;
      return;
    }
    let nameTranslation = {
      en: this.categoryForm.value.name,
      ar: this.categoryForm.value.Aname,
    }
    this.categoryForm.removeControl('Aname');
    let data = this.categoryForm.value;
    data.nameTranslation = nameTranslation;
    this.productService.addCategory(this.categoryForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }
  /**
   * update the category
   * @returns 
   */
  update() {
    this.loading = true;
    if (this.categoryForm.invalid) {
      validateField(this.categoryForm);
      this.loading = false;
      return;
    }
    this.productService.updateCategory(this.categoryForm.value).subscribe(result => {
      this.loading = false;
      this.toastService.success(result);
      this.dismissModal();
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    })
  }

  dismissModal() {
    this.modalService.dismissAll('Modal Dismiss');
  }
  closeModal() {
    this.activeModal.close('Modal close');
  }

}
