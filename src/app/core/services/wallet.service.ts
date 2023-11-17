import { Injectable } from "@angular/core"; 
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";

import { ApiService } from "./api.service";
import { DataTablesResponse, User } from "../models";
import { distinctUntilChanged, map } from "rxjs/operators";

@Injectable()
export class WalletService {
  refreshTable = new Subject();

  constructor(private apiService: ApiService) {}

  getAllWallets(filter): Observable<DataTablesResponse> {
    return this.apiService.post(`/portal/payment-card/wallets`, filter).pipe(
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
      .post(`/portal/payment-card/restaurantsTotals`, filter)
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

  updatePaymentStatus(payload) {
    return this.apiService.post(`/portal/payment-card/updatePaymentStatus?id=${payload.id}`, payload).pipe(map(data => {
      if (data && data.result) {
        return data.result;
      } else {
        return null;
      }
  }))
}
}
