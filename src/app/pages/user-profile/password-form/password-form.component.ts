import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidator} from '../../../shared/validators/password.validator';
import {UserService} from '../../../core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SweetAlertService} from "../../../core/services/sweet-alert.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.component.html'
})
export class PasswordFormComponent implements OnInit {
  changePasswordForm: FormGroup;
  Submitted = false;
  loading = false;
  showChangePasswordSuccess = true;
  changePasswordFormErrors = [];
  token = null;


  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private modalService: NgbModal,
              private route: ActivatedRoute,
              private alert: SweetAlertService,
              public translate: TranslateService

  ) {
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {validator: PasswordValidator});
  }

  onSubmit() {
    this.Submitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.loading = true;
    this.userService.changePassword(this.changePasswordForm.value)
      .pipe(first())
      .subscribe(
        data => {
          this.changePasswordForm.reset();
          this.Submitted = false;
          this.loading = false;
          this.showChangePasswordSuccess = true;
          this.alert.success('password');
          this.changePasswordFormErrors = null;
        },
        error => {
          this.loading = false;
          this.changePasswordFormErrors = error;
        });
  }
}
