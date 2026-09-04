import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Admin } from './component/admin/admin';
import { AdminGuard } from './guards/admin-guard';

export const routes: Routes = [
    {path: 'login', component: Login},
    {
        path: 'admin',
        component: Admin,
        canActivate: [AdminGuard],
        data: { breadcrumb: 'Admin' },
        // children: [
        //   { path: 'dashboard', loadComponent: () => import('./component/dashboard/dashboard').then(m => m.Dashboard), data: { breadcrumb: 'Dashboard' } },
        //   { path: 'policies', loadComponent: () => import('./component/policies/policies').then(m => m.Policies), data: { breadcrumb: 'Policies' } },
        //   { path: 'customers', loadComponent: () => import('./component/customers/customers').then(m => m.Customers), data: { breadcrumb: 'Customers' } },
        //   { path: 'agents', loadComponent: () => import('./component/agents/agents').then(m => m.Agents), data: { breadcrumb: 'Agents' } },
        //   { path: 'notifications', loadComponent: () => import('./component/notifications/notifications').then(m => m.Notifications), data: { breadcrumb: 'Notifications' } }
        // ]
    },
  { path: 'unauthorized', loadComponent: () => import('./component/unauthorized/unauthorized').then(m => m.Unauthorized) }
];
