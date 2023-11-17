import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { MarketingAdFormComponent } from './marketing-ad-form/marketing-ad-form.component';

@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css']
})
export class MarketingComponent implements OnInit {

  // links :Array<any>=[];
 links = [{ title: '', fragment: 'ads', image: 'assets/icons/ads.svg' },
        { title: '', fragment: 'voucher', image: 'assets/icons/voucher.svg' },
        { title: '', fragment: 'request', image: 'assets/icons/cart-blue.svg' }]
  subscription:Subscription;
  activeTab: string = '/product/category';
  constructor(private modalService: NgbModal, public route: ActivatedRoute, private router: Router, public translate: TranslateService , public languageService: LanguageService) {
    this.getSelectedLanguage();
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

  ngOnInit(): void { }

  linkActive(uri) {
    return this.router.url.match(uri) ? 'active' : ''
  }
  /**
  * open modal of edit product
  */
  open() {
    const modalRef = this.modalService.open(MarketingAdFormComponent, { centered: true });
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl(`/marketing/list/${this.activeTab}`);
    })
  }


  ngOnDestroy() {
   
    this.subscription.unsubscribe();
  }

  getSelectedLanguage()
  {
   
    this.subscription = this.languageService.updatedLang$.subscribe((l)=>{
      if(l == 'ar')
      {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
           this.translate.get(`marketing.${element.fragment}`).subscribe((value)=>{
            element.title = value          
          })
           }
      }
  
      if(l == 'en')
      {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
           this.translate.get(`marketing.${element.fragment}`).subscribe((value)=>{
            element.title = value         
           })
        }
      }
      
    })     
  }
}
