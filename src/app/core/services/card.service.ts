import { Injectable } from "@angular/core"; 
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";

import { ApiService } from "./api.service";
import { DataTablesResponse, User } from "../models";
import { distinctUntilChanged, map } from "rxjs/operators";

@Injectable()
export class CardService {
  refreshTable = new Subject();

  constructor(private apiService: ApiService) {}

  getAllCards(filter): Observable<DataTablesResponse> {
    return this.apiService
      .post(`/portal/payment-card/getSystemOwnerCreditCards`, filter)
      .pipe(
        map((data) => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        })
      );
  }

  getAllRestaurants(filter): Observable<DataTablesResponse> {
    return this.apiService
      .post(`/portal/payment-card/restaurants`, filter)
      .pipe(
        map((data) => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        })
      );
  }

  topup(topupData) {
    return this.apiService.post(`/payment-card/topUp`, topupData).pipe(
      map((data) => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      })
    );
  }

  getToken(tokenData) {
    return this.apiService.post(`/payment-card/getToken`, tokenData).pipe(
      map((data) => {
        if (data && data.result) {
          return data.result;
        } else {
          return null;
        }
      })
    );
  }

  delete(id) {
    return this.apiService
      .post(`/portal/payment-card/deleteCard?cardId=${id}`)
      .pipe(
        map((data) => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        })
      );
  }

  topUpUsingCashTransfer(topupData) {
    return this.apiService
      .post(`/payment-card/topUpUsingCashTransfer`, topupData)
      .pipe(
        map((data) => {
          if (data && data.result) {
            return data.result;
          } else {
            return null;
          }
        })
      );
  }
}
