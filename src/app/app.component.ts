import { Component, OnInit } from '@angular/core';

import { UserService } from './core';
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { NgbDateParserFormatterHelper } from "./helpers/ngbDateParserFormatter.helper";
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateParserFormatterHelper }]
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService, private languageService: LanguageService) {
    this.languageService.getLang();
  }

  ngOnInit() {
    this.userService.populate();
  }
}
