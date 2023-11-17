import {FormGroup} from '@angular/forms';
import {isNumber} from 'lodash'

export function NegativeValidator(form: FormGroup): { [key: string]: boolean } | null {
  let keys = Object.keys(form.controls);
  let isNegative = keys.some(k =>  Array.isArray((form.controls[k])) ? false : (form.controls[k]).value ? isNumber((form.controls[k]).value) ? (form.controls[k]).value < 0 : false : false);
  return isNegative ?
    {'negative': true} :
    null;
}
