import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MetadataService } from '../../../core/services/metadata.service';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
  selector: 'app-top-categories',
  templateUrl: './top-categories.component.html',
  styleUrls: ['./top-categories.component.scss']
})
export class TopCategoriesComponent implements OnInit {

  dataList = [];
  currency = localStorage.getItem('currency');
  selectedLang: string;
  constructor(private metaData: MetadataService, private spinner: SpinnerService, private router: Router ,public translate: TranslateService) { }

  ngOnInit(): void {
    this.getData();
    this.selectedLang = localStorage.getItem('language');

  }

  getData() {
    this.spinner.start();
    this.metaData.getTopCategories().subscribe(data => {
      this.dataList = data;
      this.spinner.stop();
    }, error => {
      this.spinner.stop();
    })
  }

  navigateToProduct(item) {
    this.router.navigateByUrl(`/product/${item.id}/${item.name}/sub-category/list`);
  }
}
