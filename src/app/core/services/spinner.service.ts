import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private subject = new Subject<any>();
  staticAlertClosed = false;
  constructor(private spinner: NgxSpinnerService) { }

  getLoading(): Observable<any> {
    return this.subject.asObservable().pipe();
  }

  start() {
    this.subject.next(true);
    // this.spinner.show();
  }
  stop() {
    // this.spinner.show();
    this.subject.next(false);
  }
}
