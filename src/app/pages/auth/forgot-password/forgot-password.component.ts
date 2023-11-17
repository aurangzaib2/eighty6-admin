import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../../../core';
import { authFieldsErrors, OPTIONS } from '../../../helpers';
import { SpinnerService } from '../../../core/services/spinner.service';
import { validateField } from '../../../shared/validators/form.validator';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
  });
  loading = false;
  emailSent = false;
  errorMessages = authFieldsErrors;
  displayMessage: string = null;
  submitted = false;

  constructor(private userService: UserService, private spinner: SpinnerService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() { }

  get form() {
    return this.forgotPasswordForm.controls;
  }

  /**
  * on click submit button API to send email
  */
  onSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      validateField(this.forgotPasswordForm);
      return;
    }
    this.loading = true;
    this.displayMessage = null;
    // this.spinner.start();
    this.userService.forgotPassword(this.forgotPasswordForm.value).subscribe(
      data => {
        // this.spinner.stop();
        this.emailSent = true;
      },
      error => {
        // this.spinner.stop();
        this.emailSent = true;
        this.loading = false;
        ;
        this.displayMessage = error;
      }
    );
  }
}
