import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataTablesResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    constructor(private apiService: ApiService) { }
    /**
     * get global restaurant listing
     * @param filter 
     * @returns 
    */
    getGlobalRestaurant() {
        return this.apiService.get(`/shared/restaurants`).pipe(map(data => {
            if (data && data.result) {
                return data.result;
            } else {
                return null;
            }
        }))
    }
}
