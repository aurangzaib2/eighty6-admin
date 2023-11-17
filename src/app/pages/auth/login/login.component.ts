import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../../core';
import { authFieldsErrors, OPTIONS } from '../../../helpers/constants.helper';
import { SpinnerService } from '../../../core/services/spinner.service';
import { validateField } from '../../../shared/validators/form.validator';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
    password: new FormControl('', [Validators.required]),
  });
  loading = false;
  submitted = false;
  errorMessages = authFieldsErrors;
  returnUrl: string;
  passwordType = 'password';
  showEye: boolean = false;
  displayMessage: string = null;
  isRememberMe: boolean = false;
  constructor(private route: ActivatedRoute, private spinner: SpinnerService,
    private router: Router, private userService: UserService) {
  }

  ngOnInit() {
    this.isRememberMe = this.userService.getRememberMe() ? true : false;
    if (this.isRememberMe) {
      this.form.email.setValue(this.userService.getRememberMe())
    }
  }
  toggleRememberMe($event) {
    this.isRememberMe = $event.target.checked ? true : false;
  }
  /**
   * get form controls
   */
  get form() {
    return this.loginForm.controls;
  }
  /**
   * hide and unhide passowrd
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

  /**
   * on click submit button API for login
  */
  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      validateField(this.loginForm);
      this.loading = false;
      return;
    }
    if (this.isRememberMe) {
      this.userService.setRememberMe(this.form.email.value);
    }
    else {
      this.userService.removeRememberMe();
    }
    this.loading = true;
    this.displayMessage = null;
    this.userService.login(this.loginForm.value).subscribe(user => {
        if (user.role == 'SYSTEM_OWNER' || user.role == 'SYSTEM_MANAGER' || user.role == 'SYSTEM_USER') {
          this.navigate();
        }
       else{
        this.displayMessage = 'Please enter valid credentials';
       }
       this.loading = false;
      },
      error => {
        this.loading = false;
        this.displayMessage = error;
        ;
      }
    );
  }

  /**
   * navigate to dashboard
   */
  navigate() {
    this.router.navigate(['/dashboard'])
  }
}
