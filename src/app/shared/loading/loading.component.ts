import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpinnerService } from '../../core/services/spinner.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  private subscription: Subscription;
  loading: boolean = false;

  constructor(private spinnerService: SpinnerService, private changeDetection: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.spinnerService.getLoading()
      .subscribe(message => {
        this.loading = message;
        this.changeDetection.detectChanges();
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
