import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { PasswordCHG } from './auth/password-chg/password-chg';
import { PasswordFG } from './auth/password-fg/password-fg';
import { Signup } from './auth/signup/signup';
import { About } from './pages/about/about';
import { Blog } from './pages/blog/blog';
import { Contact } from './pages/contact/contact';
import { Courses } from './pages/courses/courses';
import { Home } from './pages/home/home';
import { Home2 } from './pages/home2/home2';
import { Home3 } from './pages/home3/home3';
import { Reels } from './pages/reels/reels';
import { Grids } from './pages/grids/grids';
import { Profile } from './pages/profile/profile';
import { CreateCourse } from './pages/create-course/create-course';
import { ProfileC } from './pages/profile-c/profile-c';
import { AuthGuard } from './shared/auth.guard';
import { RoleGuard } from './shared/role.guard';
import { SwitchToCreator } from './pages/switch-to-creator/switch-to-creator';
import { DetailCourses } from './pages/detail-courses/detail-courses';

/* 🔥 IMPORTACIÓN AGREGADA (NO SE MODIFICÓ NADA MÁS) */
import { Payment } from './pages/payment/payment';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'password-fg', component: PasswordFG },
  { path: 'password-chg/:token', component: PasswordCHG },
  { path: 'password-chg', component: PasswordCHG },
  {
    path: 'home2',
    component: Home2,
    children: [
      { path: '', redirectTo: 'grids', pathMatch: 'full' },
      { path: 'grids', component: Grids },
      { path: 'courses', component: Courses }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'create-course',
    component: CreateCourse,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CREATOR'] }
  },
  {
    path: 'home3',
    component: Home3,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CREATOR'] }
  },
  { path: 'nosotros', component: About },
  { path: 'blog', component: Blog },
  { path: 'contacto', component: Contact },
  { path: 'courses', component: Courses },
  { path: 'courses/:id', component: DetailCourses },
  { path: 'detail-courses', component: DetailCourses },
  { path: 'reels', component: Reels },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  {
    path: 'profile-creator',
    component: ProfileC,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CREATOR'] }
  },
  {
    path: 'profile-c',
    component: ProfileC,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CREATOR'] }
  },
  { path: 'switch-to-creator', component: SwitchToCreator },

  /* 🔥 RUTA AGREGADA DEL PANEL DE PAGO */
  { path: 'payment', component: Payment }
];
