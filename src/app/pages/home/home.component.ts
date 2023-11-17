import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../../core/services';
import {Role} from "../../core/models";

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isAuthenticated: boolean;

  constructor(
    private router: Router,
    private userService: UserService
  ) {

    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
        const user = this.userService.getCurrentUser();
        if (authenticated) {
          if (user.role === Role.SYSTEM_SUPPLIER) {
            this.router.navigate(['/dashboard']);
          }
          // else if (user.role === Role.USER) {
          //   this.router.navigate(['/login']);
          // } else if (user.role === Role.SYSTEM_MANAGER) {
          //   this.router.navigate(['/dashboard']);
          // } else if (user.role === Role.SYSTEM_SUPPLIER) {
          //   this.router.navigate(['/dashboard']);
          // } else if (user.role === Role.SYSTEM_USER) {
          //   this.router.navigate(['/dashboard']);
          // } else {
          //   this.router.navigate(['/login']);
          // }
        } else {
          this.router.navigate(['/login']);
        }
      },
      error => {
        this.router.navigate(['/login']);
      }
    );
  }

}
