import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { PasswordValidator } from '../../../shared/validators/password.validator';

import { UserService } from '../../../core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  registrationForm= new FormGroup({});
  loading = false;
  submitted = false;
  registrationFormErrors = [];
  button = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    // this.registrationForm = this.fb.group({
    //   name: ['', [Validators.required]],
    //   email: ['', [Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')]],
    //   password: ['', [Validators.required, Validators.minLength(6)]],
    //   confirmPassword: ['', [Validators.required]]
    // }, { validator: PasswordValidator });
  }

  get f() {
    return this.registrationForm.controls;
  }

  onSubmit() {
    this.button = true;
    this.submitted = true;

    if (this.registrationForm.invalid) {
      this.button = false;
      return;
    }

    this.loading = true;
    let registerData = this.registrationForm.value;
    this.userService.register(registerData)
      .pipe(first())
      .subscribe(
        data => {
          this.button = false;
        },
        error => {
          this.button = false;
          this.loading = false;
          this.registrationFormErrors = error;
        });
  }

}
