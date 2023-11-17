import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params, Route} from '@angular/router';
import {User, UserService} from '../../core';

@Component({
  selector: 'app-inner-header',
  templateUrl: './inner-header.component.html'
})
export class InnerHeaderComponent implements OnInit {

  @Input() heading: string;
  @Input() showExtraHeader = false;
  @Input() title: string;
  @Input() isMenuCollapsed: boolean;
  @Output() onClickFn = new EventEmitter<string>();
  @Output() toggle = new EventEmitter<any>();
  currentUser: User;
  copied = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.userService.currentUser.subscribe(
      data => {
        this.currentUser = data;
      },
      error => {
        console.error(error);
      });
  }

  logout() {
    this.userService.purgeAuth();
    this.router.navigate(['/login'],{replaceUrl: true})
  }

  sendButtonAction(event) {
    event.preventDefault();
    this.onClickFn.emit();
  }

  onBack() {
    this.router.navigateByUrl(this.router.url.substr(0, this.router.url.lastIndexOf('/')));
  }

  copy($event) {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  collapse(){
    this.toggle.emit();
  }


}
