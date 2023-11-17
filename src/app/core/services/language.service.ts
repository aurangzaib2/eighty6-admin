import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  language: string = `en`; // or fr
  private changedLanguage = new BehaviorSubject<string>('');
  updatedLang$ = this.changedLanguage.asObservable();
  
  constructor(private translate: TranslateService) { }
  getLang() {
    this.language = localStorage.getItem(`language`);
    if (!this.language) {
      localStorage.setItem(`language`, `en`);
      this.language = `en`;
    }
    this.translate.use(this.language);
    this.changedLanguage.next(this.language)
    return this.language;
  }

  setLang(l) {
    // console.log("Setting language to : " + l);
    localStorage.setItem('language', l);
    this.language = l;
    this.changedLanguage.next(l)
    this.translate.use(l);
  }
}
