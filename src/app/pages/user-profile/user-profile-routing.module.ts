import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordFormComponent } from './password-form';
import { ProfileFormComponent } from './profileform';

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileFormComponent },
  { path: 'change-password', component: PasswordFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }


