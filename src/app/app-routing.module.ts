import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard, getAllRolesArray } from './core';
import { DefaultComponent } from './pages/container/default/default.component';
import { P404Component } from './pages/p404/p404.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password';
import { LoginComponent } from './pages/auth/login';
import { ResetPasswordComponent } from './pages/auth/reset-password';
import { SignUpComponent } from './pages/auth/sign-up';
import { userRoles } from './helpers';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: '', component: DefaultComponent,
    children: [
      {
        path: 'account-settings',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/user-profile/user-profile.module').then(m => m.UserProfileModule)
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule)
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/notification/notification.module').then(m => m.NotificationModule)
      },
      {
        path: 'faq',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/faq/faq.module').then(m => m.FaqModule)
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER']
        },
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'supplier',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/supplier/supplier.module').then(m => m.SupplierModule)
      },
      {
        path: 'marketing',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/marketing/marketing.module').then(m => m.MarketingModule)
      },
      {
        path: 'orders',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/orders/orders.module').then(m => m.OrdersModule)
      },
      {
        path: 'onboarding',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/onboarding/onboarding.module').then(m => m.OnboardingModule)
      },
      {
        path: 'product',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/product/product.module').then(m => m.ProductModule)
      },
      {
        path: 'registration',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER']
        },
        loadChildren: () => import('./pages/registration/registration.module').then(m => m.RegistrationModule)
      },
      {
        path: 'company',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/restaurant/restaurant.module').then(m => m.RestaurantModule)
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER']
        },
        loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'user-management',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER']
        },
        loadChildren: () => import('./pages/user-management/user-management.module').then(m => m.UserManagementModule)
      },
      {
        path: 'wallet',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER']
        },
        loadChildren: () => import('./pages/wallet/wallet.module').then(m => m.WalletModule)
      },
      {
        path: 'card-management',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER']
        },
        loadChildren: () => import('./pages/card-management/card-management.module').then(m => m.CardManagementModule)
      },
      {
        path: 'tickets',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER', 'SYSTEM_USER']
        },
        loadChildren: () => import('./pages/tickets/tickets.module').then(m => m.TicketsModule)
      },
      {
        path: 'transactions',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER', 'SYSTEM_MANAGER']
        },
        loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'translations',
        canActivate: [AuthGuard],
        data: {
          role: ['SYSTEM_OWNER']
        },
        loadChildren: () => import('./pages/translations/translations.module').then(m => m.TranslationModule)
      },
    ]
  },
  { path: '404', component: P404Component, data: { title: 'Page 404' } },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot((routes),
    {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
}
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
