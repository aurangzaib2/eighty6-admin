import {AbstractControl} from '@angular/forms';

export function PasswordValidator(control:AbstractControl): { [key: string]: boolean } | null {
  const Password = control.get('password');
  const ConfirmPassword = control.get('confirmPassword');
  if (Password.pristine || ConfirmPassword.pristine) {
    return null;
  }
  return Password.value !== ConfirmPassword.value ?
    {misMatch: true} :
    null;
}
