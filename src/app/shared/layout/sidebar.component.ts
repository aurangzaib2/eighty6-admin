import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../core/services';
import { Role, User } from '../../core/models';
import { Router } from '@angular/router';
import { userRoles } from '../../helpers';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  user: User = null;
  @Input() isMenuCollapsed: boolean;
  isActive = {};
  roles = userRoles.map(x => x.role)
  constructor(
    private userService: UserService, private translate: TranslateService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.userService.currentUser.subscribe(user => {
      this.user = user
    });
  }

  logout() {
    this.userService.purgeAuth();
  }


  redirectTo(uri) {
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
    this.router.navigate([uri]);
  }

  linkActive(uri) {
    return this.router.url.match(uri) ? 'active' : ''
  }

  getCurrentUserRole(roles) {
    if (this.user.role === Role.SYSTEM_OWNER) return true;
    return roles.includes(this.user.role)
  }
}
