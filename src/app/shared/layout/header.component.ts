import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { User, UserService } from '../../core';
import { SpinnerService } from '../../core/services/spinner.service';
import { MetadataService } from '../../core/services/metadata.service';
import { ToastService } from '../../core/services/toast.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';
import {Location} from '@angular/common';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [NgbDropdownConfig] // add NgbDropdownConfig to the component providers
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  currentUser: User;
  term: string = null;
  isAuthenticated: boolean = false;
  selectedLang: any;
  languageArr = [{ value: "en", lang: "EN" }, { value: "ar", lang: "AR" }];
  countryList = [{ value: "UAE", code: "AE", icon: "assets/images/uae-flag.svg" }, { value: "SA", code: "SA", icon: "assets/images/sa-flag.svg" },
  { value: "KW", code: "KW", icon: "assets/images/kw.png" }]
  selectedRegionIcon: string = null;
  selectedRegionCode: string = null;
  selectedRegionValue: string = null;

  product = [
    // { name: 'Cabbage', category: { name: 'Vegetables' }, image: 'assets/images/tomato.png', origin: 'India' },
    // { name: 'Cabbage', category: { name: 'Vegetables' }, image: 'assets/images/tomato.png', origin: 'India' }
  ];
  orders = [
    // { orderId: '123456', totalAmount: '123', restaurantLogo: 'assets/images/resto1.png', createdAt: '11 May 2021' },
    // { orderId: '987654', totalAmount: '797', restaurantLogo: 'assets/images/rest1.jpg', createdAt: '11 May 2021' },
  ];
  restaurant = [
    // { name: 'olive garden', company: { name: 'Spicy food' }, image: 'assets/images/resto1.png' }
  ];
  setTimeOut: any;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  notificationList: any = [];
  notificationCount: number = 0;
  subscription: Subscription;
  @ViewChild('searchDropDown', { static: false, read: NgbDropdown }) searchDropDown: NgbDropdown;
  currency = localStorage.getItem('currency');
  constructor(private userService: UserService, private router: Router, private toastService: ToastService, config: NgbDropdownConfig,
    private spinner: SpinnerService, private metaDataService: MetadataService, private languageService: LanguageService,
     public translate: TranslateService,   private location: Location,
    private translatationService : TranslationService) {
    // customize default values of dropdowns used by this component tree
    if (this.languageService.getLang() != "" && localStorage.getItem(`language`) != "") {
      this.location.onUrlChange(x => this.urlChange());
      this.translate.use(localStorage.getItem(`language`));
      this.selectedLang = localStorage.getItem(`language`);
      if (localStorage.getItem('region')) {
        this.selectedRegionCode = localStorage.getItem('region');
        let selectedRegion = this.countryList.filter(x => x.code === this.selectedRegionCode)[0];
        this.selectedRegionIcon = selectedRegion.icon
        this.selectedRegionValue = selectedRegion.value;
      }
    }
    config.placement = 'bottom-right';
    config.autoClose = true;

  }

  ngOnInit() {
    this.userService.isAuthenticated.subscribe(user => {
      this.isAuthenticated = user;
    })
    this.userService.currentUser.subscribe((userData) => {
      this.currentUser = userData;
      if (this.isAuthenticated) {
        this.getNotificationCount();
        this.startTimer();
      }
    });

    this.getSelectedLanguage();
  }
  urlChange(){
    this.getNotificationCount();
  }
  ngOnDestroy() {
    clearInterval(this.setTimeOut)
  }
  startTimer() {
    this.setTimeOut = setInterval(async () => {
      // this.getNotificationCount();
    }, 3000)
  }
  logout() {
    this.userService.purgeAuth();
    this.router.navigate(['/login']);
  }
  getNotificationCount() {
    // this.spinner.start();
    this.metaDataService.getUnReadNotificationCount().subscribe((result: any) => {
      // this.spinner.stop();
      this.notificationCount = result.unreadNotificationCount;
    }, error => {
      this.spinner.stop();
    })
  }
  getNotifications() {
    // this.spinner.start();
    this.metaDataService.getUnReadNotificationList({ limit: 5 }).subscribe(result => {
      // this.spinner.stop();
      this.notificationList = result;
    }, error => {
      this.spinner.stop();
    })
  }
  search() {
    this.product = [];
    this.restaurant = [];
    this.orders = [];
    if (this.term) {
      this.spinner.start();
      this.metaDataService.globalSearch({ search: this.term }).subscribe(data => {
        this.product = data.products.hits;
        this.restaurant = data.restaurants.hits;
        this.orders = data.orders.hits;
        this.searchDropDown.open();
        this.spinner.stop();
      }, error => {
        this.spinner.stop();
      })
    }
  }
  markAsRead() {
    this.spinner.start();
    this.metaDataService.markAsReadNotification({}).subscribe(success => {
      this.toastService.success(success);
      this.spinner.stop();
      this.getNotificationCount();
    }, error => {
      this.spinner.stop();
    })
  }
  navigateToOrder(item) {
    this.router.navigate([`/orders/view/${item.uniqueId}`], { queryParams: { sid: item.supplier.id } });
  }
  navigateToProductView(value) {
    let query = { pid: value.id, pn: value.displayName };
    this.router.navigate([`/product/${value.category.id}/${value.category.name}//${value.subCategory.id}/${value.subCategory.name}/seller-list`], { queryParams: query });
  }
  navigateToRestaurant(item) {
    this.router.navigate(['/company/restaurant/list'], { queryParams: { id: item.companyId, cn: item.company.name } });
  }
  navigation(item) {
    this.metaDataService.markAsReadNotification({ notificationId: item.id }).subscribe(success => {
      this.toastService.success(success);
      this.getNotificationCount();
      if (item.type === 'order') {
        this.router.navigate([`/orders/view/${item?.additional?.uniqueId}`]);
      }
      else if (item.type == "chat_message") {
        let id = JSON.parse(item?.additional)?.channelUrl;
        this.router.navigate([`/chat/`], { queryParams: { id: id } });
      }
      else if (item.type === "promotion_request") {
        this.router.navigate([`marketing/list/request`]);
      }
      else if (item.type === "product_request") {
        this.router.navigate([`/product/request/`]);
      }
      else if (item.type === "registration_request") {
        this.router.navigate([`/registration/list/`]);
      }
      else if (item.type === "ticket") {
        this.router.navigate([`tickets/view/${item?.additional.id}`]);
      }
    }, error => {
      this.spinner.stop();
    })
  }
  getLanguage() {
    return this.languageService.getLang();
  }
  changeLanguage(language) {
    this.languageService.setLang(language);
    
    this.getSelectedLanguage();
    this.setLanguage(language);
    // console.log(this.router.url)
    if(this.router.url){
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl(this.router.url);
    }
  }
  changeCountry(event) {
    let selectedRegion = this.countryList.filter(x => x.value === event.target.value)[0];
    this.selectedRegionCode = selectedRegion.code;
    this.selectedRegionIcon = selectedRegion.icon;
    this.selectedRegionValue = selectedRegion.value;
    localStorage.setItem(`region`, this.selectedRegionCode);
    this.userService.setCurrency(this.selectedRegionCode);
    if (this.router.url.match('/dashboard')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/`]);
    }
    else if (this.router.url.match('/user-management')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/user-management`]);
    }
    else if (this.router.url.match('/company')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/company`]);
    }
    else if (this.router.url.match('/faq')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/faq`]);
    }
    else if (this.router.url.match('/supplier')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/supplier`]);
    }
    else if (this.router.url.match('/marketing')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/marketing`]);
    }
    else if (this.router.url.match('/wallet')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/wallet`]);
    }
    else if (this.router.url.match('/orders')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/orders`]);
    }
    else if (this.router.url.match('/onboarding')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/onboarding`]);
    }

    else if (this.router.url.includes('/product')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/product`]);
    }
    else if (this.router.url.match('/registration')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/registration`]);
    }
    else if (this.router.url.match('/reports')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/reports`]);
    }
    else if (this.router.url.match('/tickets')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/tickets`]);
    }
    else if (this.router.url.match('/transactions')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/transactions`]);
    }

    else if (this.router.url.match('/chat')) {
      this.userService.refreshTable.next(true);
    }
    else if (this.router.url.match('/notifications')) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/notifications`]);
    }
  }
  getSelectedLanguage() {
    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (l == 'ar') {
        const dom: any = document.querySelector('body');
        dom.classList.add('rtl');
      }
      if (l == 'en') {
        const dom: any = document.querySelector('body');
        dom.classList.remove('rtl');
      }
    })
  }

  setLanguage(l){
    let language = {
      langCode: l
    }
    //console.log(language);
    this.translatationService.setLang(language).subscribe(data =>{
      //console.log(data);
    },error =>{
      console.log(error);
    })
  }
}
