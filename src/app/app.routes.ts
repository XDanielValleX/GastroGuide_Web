import { Routes } from '@angular/router';
import { Blog } from './pages/blog/blog';
import { HomeComponent } from './pages/home/home.component';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { PasswordFG } from './auth/password-fg/password-fg';
import { PasswordCHG } from './auth/password-chg/password-chg';
import { Home2 } from './pages/home2/home2';
import { Courses } from './pages/courses/courses';
import { Home3 } from './pages/home3/home3';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'password-fg', component: PasswordFG },
  { path: 'password-chg', component: PasswordCHG },
  { path: 'home2', component: Home2 },
  { path: 'home3', component: Home3 },
  { path: 'nosotros', component: About },
  { path: 'blog', component: Blog },
  { path: 'contacto', component: Contact },
  { path: 'courses', component: Courses }
];
