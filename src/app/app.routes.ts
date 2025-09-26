
import { Blog } from './pages/blog/blog';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';


;


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: "nosotros", component: About},
  {path: "blog", component: Blog},
  {path: "contacto", component: Contact}


];

