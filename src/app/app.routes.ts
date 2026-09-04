import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Admin } from './component/admin/admin';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: 'admin', component: Admin}
];
