import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupplierProductFormComponent } from '../supplier-product-form/supplier-product-form.component';

@Component({
  selector: 'app-supplier-catalogue-list',
  templateUrl: './supplier-catalogue-list.component.html',
  styleUrls: ['./supplier-catalogue-list.component.scss']
})
export class SupplierCatalogueListComponent implements OnInit {
  selectedLang: string;
  dataList = [];
  links = [
    { title: 'catalogue', fragment: 'catalogue', image: 'assets/icons/gallery.svg' },
    { title: 'supplier information', fragment: 'ino', image: 'assets/icons/info-blue.svg' },
    { title: 'order history', fragment: 'supplier/order/list', image: 'assets/icons/history.svg' },
  ];
  activeTab: string;
  supplierId: any;
  start: number = 0;
  length: number = 12;
  constructor(config: NgbDropdownConfig, private router: Router, private spinner: SpinnerService, private configModal: NgbModalConfig,
    private supplierService: SupplierService, private modalService: NgbModal, private route: ActivatedRoute  , public translate: TranslateService) {
    config.placement = 'bottom-center';
    config.autoClose = true;
    configModal.backdrop = 'static';
    configModal.keyboard = false;
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      let active = this.links.filter(x => evt.url.match(x.fragment));
      if (active && active.length) {
        this.activeTab = active[0].fragment;
      }
    });
  }

  ngOnInit(): void {
    this.selectedLang = localStorage.getItem('language');
    this.route.queryParams.subscribe(params => {
      this.supplierId = params['id'];
      this.getData();
    })
  }
  /**
   * get supplier catalogue
   */
  getData() {
    this.spinner.start();
    let query = `?supplierId=${this.supplierId}&start=${this.start}&length=${this.length}`;
    this.supplierService.getCatalogueCategories(query).subscribe(result => {
      this.dataList = result;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      // ;
    })
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.length += this.length;
      this.getData();
    }
  }
  /**
  * open modal of add product
  */
  open() {
    const modalRef = this.modalService.open(SupplierProductFormComponent, { centered: true, size: 'lg' });
    modalRef.result.then((result) => {
      // 
    }, (dismiss) => {
      // 
      this.getData();
    })
  }
  navigateToProduct(item) {
    this.router.navigate([`/supplier/catalogue/${item.id}/${item.name}/sub-category/list`], { queryParams: { id: this.supplierId } });
  }
}
