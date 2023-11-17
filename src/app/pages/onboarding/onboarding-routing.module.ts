import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnboardingDetailsComponent } from './onboarding-details/onboarding-details.component';
import { OnboardingListComponent } from './onboarding-list/onboarding-list.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: OnboardingListComponent },
  { path: 'details/:role/:id', component: OnboardingDetailsComponent },
  { path: 'details', component: OnboardingDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
