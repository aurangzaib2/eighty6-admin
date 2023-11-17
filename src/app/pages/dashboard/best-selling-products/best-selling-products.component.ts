import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-best-selling-products',
  templateUrl: './best-selling-products.component.html',
  styleUrls: ['./best-selling-products.component.css']
})
export class BestSellingProductsComponent implements OnInit {

  currency = localStorage.getItem('currency');
  constructor() { }

  ngOnInit(): void {
  }

}
