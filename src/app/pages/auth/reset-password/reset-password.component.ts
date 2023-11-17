import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { SweetAlertService } from '../../../core/services/sweet-alert.service';
import { UserService } from '../../../core';
import { validateField } from '../../../shared/validators/form.validator';
import { authFieldsErrors } from '../../../helpers';
import { PasswordValidator } from '../../../shared/validators/password.validator';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm = new FormGroup({
    otp: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: PasswordValidator });
  loading = false;
  errorMessages = authFieldsErrors;
  displayMessage: string = null;
  passwordType = 'password';
  showEye: boolean = false;
  passwordType2 = 'password';
  showEye2: boolean = false;
  submitted: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService,
    private sweetAlertService: SweetAlertService, private toastService: ToastService) { }

  ngOnInit() {
     if (this.userService.email && this.userService.token) {
      this.form.otp.setValue(this.userService.token);
      this.form.email.setValue(this.userService.email);
     } else{
        this.router.navigate(['/forgot-password'])
     }
    // this.route.params.subscribe(path => {
    //   if (path['token']) {
    //     this.form.otp.setValue(path['token']);
    //   }
    //   this.route.queryParams.subscribe(params => {
    //     this.form.email.setValue(params['email']);
    //   })
    // })

  }

  get form() {
    return this.resetPasswordForm.controls;
  }
  clearDisplayMessage() {
    this.displayMessage = null;
  }
  /**
 * hide and un-hide password
 */
  onClickEye() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.showEye = true;
    } else {
      this.passwordType = 'password';
      this.showEye = false;
    }
  }
  onClickEye2() {
    if (this.passwordType2 === 'password') {
      this.passwordType2 = 'text';
      this.showEye2 = true;
    } else {
      this.passwordType2 = 'password';
      this.showEye2 = false;
    }
  }
  /**
   * on click submit button API for reset password
  */
  onSubmit() {
    this.displayMessage = null;
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      validateField(this.resetPasswordForm);
      if (this.form.confirmPassword.value != this.form.password.value) {
        this.displayMessage = 'Password & confirm password didn\'t match';
      }
      this.loading = false;
      return;
    }
    this.loading = true;
    this.userService.resetPassword(this.resetPasswordForm.value).pipe(first()).subscribe(data => {
      this.loading = false;
      this.toastService.success(data.message);
      this.router.navigate(['/login']);
    }, error => {
      this.loading = false;
      this.displayMessage = error;
    }
    );
  }
}
