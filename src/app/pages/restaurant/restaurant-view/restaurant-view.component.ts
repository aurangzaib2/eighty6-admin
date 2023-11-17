import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { RestaurantService, UploadService, UserService } from '../../../core';
import { MetadataService } from '../../../core/services/metadata.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { Location } from '@angular/common';
import { AlertModalComponent } from '../../../shared';
import { confirmMessages } from '../../../helpers';
import { SendBirdService } from '../../../core/services/sendbird.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-view',
  templateUrl: './restaurant-view.component.html',
  styleUrls: ['./restaurant-view.component.scss'],
  providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class RestaurantViewComponent implements OnInit {

  links = [{ title: '', fragment: 'info', image: 'assets/icons/info-blue.svg' },
  { title: '', fragment: 'users', image: 'assets/icons/user.svg' },]
  subscription: Subscription;
  activeTab: string = 'info';

  restaurantData: any = {};
  companyData = { id: null, name: null };

  constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router,
    private route: ActivatedRoute, private location: Location, private modalService: NgbModal,
    private spinner: SpinnerService, private onboardingService: OnboardingService, private sendBirdService: SendBirdService,
    private toastService: ToastService, private restaurantService: RestaurantService, private userService: UserService, public languageService: LanguageService, public translate: TranslateService) {
    // customize default values of dropdown used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
    // customize default values of modals used by this component tree
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
    this.getSelectedLanguage();
    this.getRestaurantData();
  }

  getRestaurantData() {
    let id = this.route.snapshot.queryParams['id'];
    this.route.queryParams.subscribe(params => {
      if (params['cid']) {
        this.companyData = {
          id: params['cid'],
          name: params['cn']
        }
      }
    })
    this.onboardingService.getProfileRestaurant(id).subscribe((restaurantDataData) => {
      this.restaurantData = restaurantDataData;
      this.restaurantService.setRestaurantData(this.restaurantData)
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      ;
    });
  }
  /**
 * return the banner url
 * @returns 
 */
  getUrl() {
    return this.restaurantData?.banner != null ? `${this.restaurantData?.banner}` : 'assets/images/placeholder_banner.jpg';
  }
  edit() {
    this.router.navigate(['/company/restaurant/details'], { queryParams: { cid: this.companyData.id, cn: this.companyData.name, rid: this.restaurantData.id, rn: this.restaurantData.name } });
  }
  /**
  * open modal to confirm delete
  */
  openConfirmDelete() {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = confirmMessages.deleteTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription') +` `+this.translate.instant('confirmMessages.thisRestaurant') + ` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.crossButton;
    modalRef.result.then((result) => {
    }, (dismiss) => {
      this.deleteRequest();
    })
  }
  /**
   * delete restaurant request
   * @param item 
   */
  deleteRequest() {
    this.spinner.start();
    this.restaurantService.deleteRestaurant(this.restaurantData.id).subscribe(result => {
      this.toastService.success(result.message);
      this.goBack();
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
      this.toastService.error(error);
    })
  }
  /**
   * open confirm
   */
  openConfirmStatus() {
    let text = this.restaurantData.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block');
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
    // modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
    modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') + ` ${text} ` + this.translate.instant('confirmMessages.thisRestaurant') + ` ?`;
    modalRef.componentInstance.okText = this.translate.instant('confirmMessages.confirm');
    modalRef.componentInstance.cancelText = this.translate.instant('confirmMessages.cancel');
    modalRef.componentInstance.image = confirmMessages.blockButton;
    modalRef.result.then((result) => {

    }, (dismiss) => {

      this.updateRestaurantStatus();
    })
  }
  /**
   * approve/reject restaurant
   */
  updateRestaurantStatus() {
    this.spinner.start();
    this.restaurantService.updateRestaurantStatus(this.restaurantData).subscribe(
      data => {
        this.toastService.success(data.message);
        this.getRestaurantData();
        this.userService.refreshTable.next(true);
      },
      error => {
        this.spinner.stop();
        this.toastService.error(error);
      }
    );
  }

  goBack() {
    this.router.navigate(['/company/restaurant/list'], { queryParams: { id: this.restaurantData.company.id, cn: this.restaurantData.company.name } });
    // this.location.back();
  }
  goBackTwice() {
    window.history.go(-2);
  }

  startChat() {
    this.spinner.start();
    this.userService.currentUser.subscribe((user) => {
      let params = {
        role: 'restaurant',
        id: this.restaurantData.id
      }
      this.userService.getUserId(params).subscribe(data => {
        let ids = [data.id.toString(), user.id.toString()];
        let name = `${user.firstName} ${user.lastName}`;
        let DATA = {
          sender: `${user.firstName} ${user.lastName}`,
          receiver: this.restaurantData.name
        };
        this.sendBirdService.getChannelVieUser(ids).then((channel) => {
          if (channel.length === 0) {
            this.sendBirdService.createChannel(ids, name, DATA).then((channel) => {
              this.spinner.stop();
              this.router.navigate(['chat'], { queryParams: { id: channel.url } })
            }).catch((error) => {
              this.spinner.stop();
              this.toastService.error('Opps, something went wrong !!')
            });
          }
          else {
            this.spinner.stop();
            this.router.navigate(['chat'], { queryParams: { id: channel[0].url } })
          }
        }).catch((error) => {
          this.spinner.stop();
          this.toastService.error('Opps, something went wrong !!')
        });
      })
    })
  }

  getSelectedLanguage() {

    this.subscription = this.languageService.updatedLang$.subscribe((l) => {
      if (l == 'ar') {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
          this.translate.get(`restaurants.${element.fragment}`).subscribe((value) => {
            element.title = value
          })
        }
      }

      if (l == 'en') {
        this.translate.use(l)
        for (let i = 0; i < this.links.length; i++) {
          const element = this.links[i];
          this.translate.get(`restaurants.${element.fragment}`).subscribe((value) => {
            element.title = value
          })
        }
      }

    })
  }
}
