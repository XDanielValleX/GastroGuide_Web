import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { PasswordFG } from './auth/password-fg/password-fg';
import { PasswordCHG } from './auth/password-chg/password-chg';

export const routes: Routes = [
    { path: 'signup', component: Signup },
    { path: '', redirectTo: '/signup', pathMatch: 'full' },

    // Puedes dejar las otras si las necesitas
    { path: 'signup', component: Signup },
    { path: 'login', component: Login },
    { path: 'change', component: PasswordCHG },
    {path: 'forgot', component: PasswordFG },
];
