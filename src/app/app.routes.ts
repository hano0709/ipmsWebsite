import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Admin } from './component/admin/admin';
import { AdminGuard } from './guards/admin-guard';
import { Agent } from './component/agent/agent';
import { AgentGuard } from './guards/agent-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: Admin,
    canActivate: [AdminGuard],
    data: { breadcrumb: 'Admin' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./component/admin/dashboard/dashboard').then(m => m.Dashboard), data: { breadcrumb: 'Dashboard' } },
      { path: 'customers-agents', loadComponent: () => import('./component/admin/customers-agents/customers-agents').then(m => m.CustomersAgentsComponent), data: { breadcrumb: 'Customers & Agents Management' } },
      {
        path: 'policies',
        data: { breadcrumb: 'Policies' },
        children: [
          {
            path: '',
            loadComponent: () => import('./component/admin/policies-list/policies-list').then(m => m.PoliciesList),
            data: { breadcrumb: 'Policies' }
          },
          { 
            path: 'create', 
            loadComponent: () => import('./component/admin/policy-form/policy-form').then(m => m.PolicyForm),
            data: {breadcrumb: "Policy Creation"}
          },
          {
            path: ':policyNumber',
            loadComponent: () => import('./component/admin/policy-details/policy-details').then(m => m.PolicyDetails),
            data: { breadcrumb: 'Policy Details' }
          }
        ]
      },
      //   { path: 'notifications', loadComponent: () => import('./component/notifications/notifications').then(m => m.Notifications), data: { breadcrumb: 'Notifications' } }
      { path: 'customers/add', loadComponent: () => import('./component/admin/customers-agents/customers-agents').then(m => m.CustomersAgentsComponent), data: { breadcrumb: 'Customer & Agents Management' } },
      { path: 'agents/add', loadComponent: () => import('./component/admin/customers-agents/customers-agents').then(m => m.CustomersAgentsComponent), data: { breadcrumb: 'Customer & Agents Management' } },
    ]
  },
  {
    path: 'agent',
    component: Agent,
    canActivate: [AgentGuard],
    data: { breadcrumb: 'Agent' },
    //children: [
      //{ path: 'dashboard', loadComponent: () => import('./component/agent/dashboard/dashboard').then(m => m.Dashboard), data: { breadcrumb: 'Dashboard' } },
      //{ path: 'customers-agents', loadComponent: () => import('./component/agent/customers-agents/customers-agents').then(m => m.CustomersAgentsComponent), data: { breadcrumb: 'Customers & Agents Management' } },
      // {
      //   path: 'policies',
      //   data: { breadcrumb: 'Policies' },
      //   children: [
      //     {
      //       path: '',
      //       loadComponent: () => import('./component/admin/policies-list/policies-list').then(m => m.PoliciesList),
      //       data: { breadcrumb: 'Policies' }
      //     },
      //     { 
      //       path: 'create', 
      //       loadComponent: () => import('./component/admin/policy-form/policy-form').then(m => m.PolicyForm),
      //       data: {breadcrumb: "Policy Creation"}
      //     },
      //     {
      //       path: ':policyNumber',
      //       loadComponent: () => import('./component/admin/policy-details/policy-details').then(m => m.PolicyDetails),
      //       data: { breadcrumb: 'Policy Details' }
      //     }
      //   ]
      //},
      //   { path: 'notifications', loadComponent: () => import('./component/notifications/notifications').then(m => m.Notifications), data: { breadcrumb: 'Notifications' } }
      //{ path: 'customers/add', loadComponent: () => import('./component/admin/customers-agents/customers-agents').then(m => m.CustomersAgentsComponent), data: { breadcrumb: 'Customer & Agents Management' } },
    //]
  },
  { path: 'unauthorized', loadComponent: () => import('./component/unauthorized/unauthorized').then(m => m.Unauthorized) },
];
