import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { DataTablesResponse, User } from '../models';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SendBirdService } from './sendbird.service';
import { currency } from '../../helpers';


@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  refreshTable = new Subject();
  token: number;
  email:string;
  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private sendBird: SendBirdService) { }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/portal/user/profile')
        .subscribe(
          data => {
            if (data.result) {
              this.setAuth(data.result);
            } else {
              this.purgeAuth();
            }
          },
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    if (user.token && user.region) {
      this.jwtService.saveToken(user.token);
      localStorage.setItem('region', user.region);
      this.setCurrency(user.region); 
    }
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
    this.sendBird.connect(user);
    if (user.variablesId) {
      localStorage.removeItem('bulkUploadId')
    }
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }
  /**
   * set rememberMe in local storage
   * @param value 
   */
  setRememberMe(value) {
    localStorage.setItem('rememberMe', value);
  }
  /**
   * get the rememberMe value
   * @returns 
   */
  getRememberMe() {
    return localStorage.getItem('rememberMe');
  }
  /**
   * remove rememberMe
   */
  removeRememberMe() {
    localStorage.removeItem('rememberMe');
  }

  setCurrency(region) {
    if (region === 'AE') {
      localStorage.setItem('currency', 'AED');
    }
    if (region === 'SA') {
      localStorage.setItem('currency', 'SR')
    }
    if (region === 'KW') {
      localStorage.setItem('currency', 'KWD')
    }
    
  }

  /**
   * login to app
   * @param credentials 
   * @returns 
   */
  login(credentials): Observable<User> {
    let url = `/portal/user/login`;
    return this.apiService.post(url, credentials).pipe(map(
      data => {
        if (data && data.result) {
          this.setAuth(data.result);
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * register the user to app
   * @param credentials 
   * @returns 
   */
  register(credentials): Observable<User> {
    return this.apiService.post('/portal/user/create', credentials)
      .pipe(map(
        data => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        }
      ));
  }
  /**
   * send verificatin token from backend to reset password
   * @param credentials 
   * @returns 
   */
  forgotPassword(credentials) {
    return this.apiService.post('/portal/user/forgot-password', credentials).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * verify the code
   * @param credentials 
   * @returns 
   */
  resetPasswordVerify(credentials): Observable<User> {
    return this.apiService.post(`/portal/user/reset-password-verify/`, credentials).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * resewt user password
   * @param credentials 
   * @returns 
   */
  resetPassword(credentials) {
    return this.apiService.post('/portal/user/reset-password', credentials)
      .pipe(map(
        data => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        }
      ));
  }
  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  /**
   * create a new user
   * @param credentials 
   * @returns 
   */
  addUser(credentials) {
    return this.apiService.post('/portal/user/create', credentials).pipe(map(
      data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }
    ));
  }
  /**
   * get all the users
   * @param filter 
   * @returns 
   */
  getAllUsers(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/user/listing`, filter).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * update user 
   * @param id 
   * @param user 
   * @returns 
   */
  update(id, user) {
    return this.apiService
      .post(`/portal/user/update/${id}`, user).pipe(map(data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }));
  }
  /**
   * change user status ( block and unblock )
   * @param id 
   * @returns 
   */
  changeStatus(id) {
    return this.apiService.post(`/portal/user/status/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }))
  }
  /**
   * delete the user
   * @param id 
   * @returns 
   */
  delete(id) {
    return this.apiService.post(`/portal/user/delete/${id}`).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
    }
    ));
  }

  /**
   * get account setting profile
   * @returns 
   */
  getProfile() {
    return this.apiService.get('/portal/user/profile').pipe(map(data => {
      if (data && data.result) {
        this.currentUserSubject.next(data.result);
        return data.result;
      } else {
        return null;
      }
    }));
  }

  /**
   * update account setting profile
   * @param payload 
   * @returns 
   */
  updateProfile(payload): Observable<User> {
    return this.apiService
      .post('/portal/user/update-profile', payload)
      .pipe(map(data => {
        if (data && data.result) {
          this.populate()
          return data.result;
        } else {
          return null;
        }
      }));
  }
  /**
   * api for getting user id of restaurant/company,supplier
   */
  getUserId(params) {
    return this.apiService.get(`/shared/get-user-id`, params).pipe(map(data => {
      if (data && data.result) {
        // this.currentUserSubject.next(data.result);
        return data.result;
      } else {
        return null;
      }
    }));
  }
  /**
   * update password API
   * @param payload 
   * @returns 
   */
  changePassword(payload): Observable<User> {
    return this.apiService
      .post('/admin/update-password', payload)
      .pipe(map(data => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      }));
  }

}

