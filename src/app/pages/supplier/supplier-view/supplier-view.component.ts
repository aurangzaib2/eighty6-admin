import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgbDropdownConfig, NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core';
import { LanguageService } from '../../../core/services/language.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { SendBirdService } from '../../../core/services/sendbird.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { confirmMessages } from '../../../helpers';
import { AlertModalComponent } from '../../../shared';

@Component({
	selector: 'app-supplier-view',
	templateUrl: './supplier-view.component.html',
	styleUrls: ['./supplier-view.component.scss'],
	providers: [NgbDropdownConfig, NgbModalConfig, NgbModal]
})
export class SupplierViewComponent implements OnInit {

	links = [
		{ title: '', translateWord: "catalogue", fragment: 'catalogue', image: 'assets/icons/gallery.svg' },
		{ title: '', translateWord: "supplierInformation", fragment: 'info', image: 'assets/icons/info-blue.svg' },
		{ title: '', translateWord: "orderHistory", fragment: 'order/list', image: 'assets/icons/history.svg' },
		{ title: '', translateWord: "myProducts", fragment: 'order/market-list/restaurants', image: 'assets/icons/market-list-blue.svg' }
	];
	activeTab: string = 'catalogue';
	subscription: Subscription;

	supplierData: any = {};
	supplierId: any;
	constructor(config: NgbDropdownConfig, configModal: NgbModalConfig, private router: Router,
		private route: ActivatedRoute, private location: Location, private modalService: NgbModal,
		public languageService: LanguageService,
		private spinner: SpinnerService, private onboardingService: OnboardingService, private sendBirdService: SendBirdService,
		private toastService: ToastService, private supplierService: SupplierService, private userService: UserService, public translate: TranslateService) {
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
		this.route.queryParams.subscribe(params => {
			this.supplierId = params['id'];
			this.getSupplierData();
		})
	}

	getSupplierData() {
		this.supplierService.getProfileSupplier(this.supplierId).subscribe((restaurantDataData) => {
			this.supplierData = restaurantDataData;
			this.supplierService.setSupplierData(this.supplierData)
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
		return this.supplierData?.banner != null ? `${this.supplierData?.banner}` : 'assets/images/banner.png';
	}
	edit() {
		this.router.navigate([`/supplier/details`], { queryParams: { id: this.supplierData.id, sn: this.supplierData.name } });
	}
	/**
	* open modal to confirm delete
	*/
	openConfirmDelete() {
		const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
		// modalRef.componentInstance.title = confirmMessages.deleteTitle;
		modalRef.componentInstance.description = this.translate.instant('confirmMessages.deleteDescription')+` `+this.translate.instant('confirmMessages.thisSupplier')+` ?`;
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
		this.supplierService.deleteSupplier(this.supplierData.id).subscribe(result => {
			this.toastService.success(result.message);
			this.goBack();
			this.spinner.stop();
		}, error => {
			;
			this.spinner.stop();
			this.toastService.error(error);
		})
	}
	/**
	 * open confirm
	 */
	openConfirmStatus() {
		let text = this.supplierData.status == 'active' ? this.translate.instant('confirmMessages.block') : this.translate.instant('confirmMessages.un-block');
		const modalRef = this.modalService.open(AlertModalComponent, { centered: true });
		// modalRef.componentInstance.title = text + ' ' + confirmMessages.hideTitle;
		modalRef.componentInstance.description = this.translate.instant('confirmMessages.hideDescription') +` ${text} `+ this.translate.instant('confirmMessages.thisSupplier')+` ?`;
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
		this.supplierService.updateStatus(this.supplierData).subscribe(
			data => {
				this.toastService.success(data.message);
				this.getSupplierData();
				this.userService.refreshTable.next(true)
			},
			error => {
				this.spinner.stop();
				this.toastService.error(error);
			}
		);
	}

	goBack() {
		this.location.back();
	}

	startChat() {
		this.spinner.start();
		this.userService.currentUser.subscribe((user) => {
			let params = {
				role: 'supplier',
				id: this.supplierId
			}
			this.userService.getUserId(params).subscribe(data => {
				let ids = [data.id.toString(), user.id.toString()];
				let name = `${user.firstName} ${user.lastName}`;
				let DATA = {
					sender: `${user.firstName} ${user.lastName}`,
					receiver: this.supplierData.name
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
					this.translate.get(`suppliers.${element.translateWord}`).subscribe((value) => {
						element.title = value
					})
				}
			}

			if (l == 'en') {
				this.translate.use(l)
				for (let i = 0; i < this.links.length; i++) {
					const element = this.links[i];
					this.translate.get(`suppliers.${element.translateWord}`).subscribe((value) => {
						element.title = value
					})
				}
			}

		})
	}
}
