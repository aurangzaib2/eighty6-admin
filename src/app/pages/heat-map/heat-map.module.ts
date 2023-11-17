import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatMapComponent } from './heat-map.component';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';


const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: HeatMapComponent },
];

@NgModule({
  declarations: [HeatMapComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: ''
    }),
  ]
})
export class HeatMapModule { }
