import {Component, Input} from '@angular/core';

import {Errors} from '../../core';

@Component({
  selector: 'app-list-errors',
  templateUrl: './form-errors.component.html'
})
export class FormErrorsComponent {
  @Input()
  errors: Errors[] = [];

  get errorList() {
    return this.errors;
  }
}
