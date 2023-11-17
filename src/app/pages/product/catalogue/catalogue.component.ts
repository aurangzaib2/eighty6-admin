import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class CatalogueComponent implements OnInit {

  links = [{ title: '', translateWord: "allProducts", fragment: '/product/category', image: 'assets/icons/gallery.svg' },
  { title: '', translateWord: "productRequest", fragment: '/product/request', image: 'assets/icons/cart-blue.svg' },
  { title: 'manage', translateWord: "manage", fragment: '/product/manage', image: 'assets/icons/settings.svg' }]
  subscription: Subscription;
  activeTab: string = '/product/category';
  constructor(private modalService: NgbModal, public route: ActivatedRoute, private router: Router, public translate: TranslateService, public languageService: LanguageService) {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      let active = this.links.filter(x => x.fragment.match(evt.url));
      if (active && active.length) {
        this.activeTab = active[0].fragment;
      }
    });
    this.getSelectedLanguage();
  }

  ngOnInit(): void { }

  linkActive(uri) {
    return this.router.url.match(uri) ? 'active' : ''
  }
  /**
  * open modal of edit product
  */
  open() {
    const modalRef = this.modalService.open(CategoryFormComponent, { centered: true });
    modalRef.result.then((result) => {

    }, (dismiss) => {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl(this.activeTab);
    })
  }

  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (l == 'ar') {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
          this.translate.get(`catalogue.${element.translateWord}`).subscribe((value) => {
            element.title = value
          })
        }
      }
      if (l == 'en') {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
          this.translate.get(`catalogue.${element.translateWord}`).subscribe((value) => {
            element.title = value
          })
        }
      }
    })
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
