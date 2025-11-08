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

import { ComprarCursosComponent } from './pages/comprar-cursos/comprar-cursos';
import { CursoDetalleComponent } from './pages/curso-detalle/curso-detalle';
import { CarritoComponent } from './pages/carrito/carrito';
import { VerMisCursosComponent } from './pages/ver-mis-cursos/ver-mis-cursos';
import { CheckoutComponent } from './pages/checkout/checkout';



export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'nosotros', component: About },
  { path: 'blog', component: Blog },
  { path: 'signup', component: Signup },
  { path: 'home2', component: Home2 },
  { path: 'contacto', component: Contact },
  { path: 'comprar-cursos', component: ComprarCursosComponent },
  { path: 'curso/:id', component: CursoDetalleComponent },
  { path: 'checkout/:id', component: CheckoutComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'mis-cursos', component: VerMisCursosComponent },
];

  { path: 'signup', component: Signup },
  { path: 'password-fg', component: PasswordFG },
  { path: 'password-chg', component: PasswordCHG },
  { path: 'home2', component: Home2 },
  { path: 'nosotros', component: About },
  { path: 'blog', component: Blog },
  { path: 'contacto', component: Contact },

