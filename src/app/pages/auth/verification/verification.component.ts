import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { UserService } from '../../../core';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

  @Input() email: string = null;
  verificationForm = new FormGroup({
    dataArray: new FormArray([
      new FormControl('', [Validators.required]), new FormControl('', [Validators.required]),
      new FormControl('', [Validators.required]), new FormControl('', [Validators.required])
    ])
  });
  inputArray = this.verificationForm.get('dataArray') as FormArray;
  displayMessage: string = null;
  loading = false;
  enableResend: boolean = false;
  duration: number = 60;
  minutes: any = '00';
  seconds: any = '00';
  setTimeOut: any;
  constructor(private userService: UserService, private spinner: SpinnerService, private el: ElementRef,
    private route: ActivatedRoute, private router: Router, private renderer2: Renderer2) { }

  ngOnInit(): void {
    this.startTimer();
  }
  toggleResend() {
    this.enableResend = !this.enableResend;
  }

  startTimer() {
    // this.toggleResend();
    this.setTimeOut = setInterval(() => {
      if (this.duration <= 0) {
        this.stopTimer();
        return;
      }
      this.duration--;
      let min = this.duration / 60;
      let sec = this.duration % 60;
      this.minutes = String('0' + Math.floor(min)).slice(-2);
      this.seconds = String('0' + Math.floor(sec)).slice(-2);
    }, 1000)
  }
  stopTimer() {
    clearInterval(this.setTimeOut);
    this.toggleResend();
  }
  /**
   * add code to array
   * @param value // code enter by user
   * @param index index of array
   */
  addCode(value, index) {
    this.inputArray.value[index] = value;
    this.renderer2.parentNode(this.el.nativeElement).focus();
    if(index == 4){
    this.renderer2.parentNode(this.el.nativeElement).focus();

    }
  }
  /**
  * on click submit button API to send email
  */
  resendCode() {
    if (!this.enableResend) {
      return;
    }
    this.displayMessage = null;
    // this.spinner.start();
    this.userService.forgotPassword({ email: this.email }).subscribe(
      data => {
        // this.spinner.stop();
        this.enableResend = false;
        this.displayMessage = data.message;
      },
      error => {
        // this.spinner.stop();
        this.loading = false;
        ;
        this.displayMessage = error;
      }
    );
  }
  /**
   * API to to verify code
   */
  onSubmit() {
    const arr: string = this.inputArray.value.join('');
    this.displayMessage = null;
    if (arr.length < this.inputArray.value.length) {
      this.displayMessage = 'please enter all digits'
      return;
    }
    let obj = {
      email: this.email,
      otp: parseInt(arr)
    }
    this.userService.resetPasswordVerify(obj).subscribe(user => {
      // this.spinner.stop();
      this.navigate(obj.otp);
      this.userService.email = this.email;
      this.userService.token = obj.otp;
    },
      error => {
        // this.spinner.stop();
        this.loading = false;
        this.displayMessage = error;
      }
    );
  }

  /**
   * navigate to reset password
   */
  navigate(token) {
   // this.router.navigate([`/reset-password/${this.crypto.encrypt(token)}`], {queryParams:{email:this.crypto.encryptString(this.email)}, replaceUrl: true })
    this.router.navigate([`/reset-password/`])
  }
}
