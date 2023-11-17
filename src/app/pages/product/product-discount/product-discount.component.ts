import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-discount',
  templateUrl: './product-discount.component.html',
  styleUrls: ['./product-discount.component.scss']
})
export class ProductDiscountComponent implements OnInit {

  dataList = [];
  currency = localStorage.getItem('currency');
  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private modalService: NgbModal, private router: Router,
    private route: ActivatedRoute, private location: LocationStrategy, private productService: ProductService , public translate: TranslateService) {
    config.placement = 'bottom-center';
    config.autoClose = false;
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    let query = `?isDiscounted=${true}`;
    this.productService.getProducts(query).subscribe(result => {
      this.dataList = result;

    }, error => {

    })
  }
}
