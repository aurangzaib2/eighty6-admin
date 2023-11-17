import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[inputNumber]'
})
export class InputIntegerDirective {
	constructor() { }
	@HostListener('input', ['$event.target']) onInput(input) {
		if (input.value != parseInt(input.value, 10)) {
			input.value = input.value.replace(/[a-z,A-Z,&\/\\#,^!-@+()$~%.'":*?_<>{}-]*/g, '');
		}
	}
}
