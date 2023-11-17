import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';



@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  private subscription: Subscription;
  message: any = {};

  constructor(private alertService: ToastService) { }

  ngOnInit() {
    this.subscription = this.alertService.getAlert()
      .subscribe(message => {
        switch (message && message.type) {
          case 'success':
            message.cssClass = 'alert alert-success';
            break;
          case 'error':
            message.cssClass = 'alert alert-danger';
            break;
        }
        this.message = message;
        setTimeout(() => this.remove(), 8000)
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  remove() {
    this.message = {};
    this.alertService.clear();
  }
}
