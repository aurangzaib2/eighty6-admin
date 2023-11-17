import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private subject = new Subject<any>();
  staticAlertClosed = false;
  constructor() { }

  getAlert(): Observable<any> {
    return this.subject.asObservable().pipe();
  }

  success(message: string) {
    this.subject.next({ type: 'success', text: 'Success message', description: message, icon: 'fa-check' });
  }

  error(message: string) {
    this.subject.next({ type: 'error', text: 'Error message', description: message, icon: 'fa-times' });
  }

  clear() {
    // clear by calling subject.next() without parameters
    this.subject.next();
  }
}
