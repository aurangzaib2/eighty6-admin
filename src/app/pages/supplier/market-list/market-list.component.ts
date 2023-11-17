import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-market-list',
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss']
})
export class MarketListComponent implements OnInit {

  links = [
    { title: '', translateWord: "restaurants", fragment: '/supplier/order/market-list/restaurants' },
    { title: '', translateWord: "products", fragment: '/supplier/order/market-list/special-price', }
  ];
  activeTab: string = '';
  subscription: Subscription;
  supplierData: any = {};
  constructor(public route: ActivatedRoute, private router: Router, public translate: TranslateService,
    public languageService: LanguageService, private supplierService: SupplierService) {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      let url = evt.url.split('?');
      let active = this.links.filter(x => x.fragment.match(url[0]));
      if (active && active.length) {
        this.activeTab = active[0].fragment;
      }
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.supplierService.supplierData$.subscribe(data => {
      this.supplierData = data;
    })
  }
  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      this.translate.use(l)
      for (let i = 0; i < this.links.length; i++) {
        const element = this.links[i];
        this.translate.get(`sidebar.${element.translateWord}`).subscribe((value) => {
          element.title = value
        })
      }
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
