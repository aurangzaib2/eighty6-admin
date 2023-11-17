import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html'
})
export class AlertModalComponent {

  @Input() title: string;
  @Input() description: string;
  @Input() cancelText: string = null;
  @Input() okText: string = null;
  @Input() image: string = null;

  // @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert: NgbAlert;
  // private _success = new Subject<string>();
  // staticAlertClosed = false;
  // successMessage = '';

  constructor(public activeModal: NgbActiveModal) {
    // this._success.subscribe(message => this.successMessage = message);
    // this._success.pipe(debounceTime(5000)).subscribe(() => {
    //   if (this.selfClosingAlert) {
    //     this.selfClosingAlert.close;
    //   }
    // });
  }


}
