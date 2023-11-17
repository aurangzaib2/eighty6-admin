import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable()

export class TranslationService{
    url: string = '/translation';

    constructor(private apiService: ApiService) { }

    setLang(payload){
        return this.apiService.post(`${this.url}/set`,payload).pipe(map(data =>{
            if (data && data.result) {
                return data.result;
              } else {
                return null;
              }
        }))
    }

    addTranslations(payload){
      return this.apiService.post(`${this.url}/add`,payload).pipe(map(data =>{
        if (data && data.result) {
          return data.result;
          } else {
            return null;
          }
      }))
    }

    getTranslationFile(query){
      return this.apiService.get(`${this.url}/get?langCode=${query}`).pipe(map(data=>{
        if (data) {
          return data;
          } else {
            return null;
          }
      }))
    }

    saveTranslationFile(payload){
      return this.apiService.post(`${this.url}/save`,payload).pipe(map(data=>{
        if (data && data.result) {
          return data.result;
          } else {
            return null;
          }
      }))
    }
}