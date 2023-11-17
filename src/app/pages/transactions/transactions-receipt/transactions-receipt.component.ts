import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../core';
import { SendBirdService } from '../../../core/services/sendbird.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { currency, TAX } from '../../../helpers';

@Component({
  selector: 'app-transactions-receipt',
  templateUrl: './transactions-receipt.component.html',
  styleUrls: ['./transactions-receipt.component.scss']
})
export class TransactionsReceiptComponent implements OnInit {

  @Input() transactionData: any = {};
  currency = localStorage.getItem('currency');
  TAX: number;
  constructor(public activeModal: NgbActiveModal, public translate: TranslateService, private userService: UserService,
    private sendBirdService: SendBirdService, private spinner: SpinnerService, private toastService: ToastService,
    private router: Router) {
    this.TAX = this.currency === currency.UAE ? TAX.UAE : TAX.SA;
  }


  ngOnInit(): void {
  }
  /**
   * close modal
   */
  closeModal() {
    this.activeModal.close('close modal');
  }

  startChat() {
    this.spinner.start();
    this.userService.currentUser.subscribe((user) => {
      let params = {
        role: 'restaurant',
        id: this.transactionData.restaurantId
      }
      this.userService.getUserId(params).subscribe(data => {
        let ids = [data.id.toString(), user.id.toString()];
        let name = `${user.firstName} ${user.lastName}`;
        let DATA = {
          sender: `${user.firstName} ${user.lastName}`,
          receiver: this.transactionData.restaurantName
        };
        this.sendBirdService.getChannelVieUser(ids).then((channel) => {
          this.closeModal();
          if (channel.length === 0) {
            this.sendBirdService.createChannel(ids, name, DATA).then((channel) => {
              console.log(channel);
              this.spinner.stop();
              this.router.navigate(['chat'], { queryParams: { id: channel.url } })
            }).catch((error) => {
              this.toastService.error('Opps, something went wrong !!')
            });
          }
          else {
            this.spinner.stop();
            this.router.navigate(['chat'], { queryParams: { id: channel[0].url } })
          }
        }).catch((error) => {
          this.toastService.error('Opps, something went wrong !!')
        });
      })
    })
  }
}
