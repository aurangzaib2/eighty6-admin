import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

import { Role } from '../models';
import { UserService } from './user.service';
import { take, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanLoad {
  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    // return true;// TODO remove
    return this.userService.isAuthenticated.pipe(take(1), tap(allowed => {

      if (!allowed) {
        let returnUrl = state.url;
        this.router.navigate(['login'], { queryParams: { returnUrl } });
      } else {
        const currentUser = this.userService.getCurrentUser();
        if (currentUser) {
          if (route.data.roles && route.data.roles.length) {
            if (currentUser.role === Role.SYSTEM_OWNER) return true;
            let roles = route.data.roles;
            let isGranted = roles.includes(currentUser.role);
            if (isGranted) {
              return true;
            }
            this.router.navigate(['/']);
            return false;
          }
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }
    }
    ));
  }
  // canLoad() {
  //   return true;
  // }
  canLoad(route: Route, segemets: UrlSegment[]): Observable<boolean> {
    return this.userService.isAuthenticated.pipe(take(1), tap(allowed => {
      if (!allowed) {
        let returnUrl = segemets[0].path;
        this.router.navigate(['login'], { queryParams: { returnUrl } });
      } else {
        const currentUser = this.userService.getCurrentUser();
        if (currentUser) {
          // check if route is restricted by role
          if (route.data.role && !route.data.role.includes(currentUser.role)) {
            // role not authorized so redirect to home page
            this.router.navigate(['/company']);
            return false;
          }
          // authorized so return true
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }
    }))
  }
}
