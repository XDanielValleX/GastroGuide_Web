
import { Blog } from './pages/blog/blog';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Search } from './pages/search/search';
import { WatchVideosComponent } from './pages/watch-videos/watch-videos';
import { Profilecomponent } from './pages/profile/profile';


;


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: "nosotros", component: About},
  {path: "blog", component: Blog},
  {path: "contacto", component: Contact},
  {path: "buscar", component: Search},
  { path: 'watch-videos', component: WatchVideosComponent },
  {path: "profile", component: Profilecomponent}


];

