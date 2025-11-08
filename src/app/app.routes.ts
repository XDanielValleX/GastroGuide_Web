
import { Blog } from './pages/blog/blog';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
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