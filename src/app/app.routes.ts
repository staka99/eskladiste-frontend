import { Routes } from '@angular/router';
import { KupciComponent } from './podaci/kupci/kupci.component';
import { SkladisteComponent } from './podaci/skladiste/skladiste.component';
import { TransakcijeComponent } from './podaci/transakcije/transakcije.component';
import { NaloziUIzradiComponent } from './podaci/nalozi-u-izradi/nalozi-u-izradi.component';
import { NaloziZavrseniComponent } from './podaci/nalozi-zavrseni/nalozi-zavrseni.component';
import { LoginComponent } from './login/login.component';
import { KompanijeComponent } from './admin/kompanije/kompanije.component';
import { KorisniciComponent } from './admin/korisnici/korisnici.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'skladiste', component: SkladisteComponent },
  { path: 'kupci', component: KupciComponent },
  { path: 'radni-nalozi-u-izradi', component: NaloziUIzradiComponent },
  { path: 'radni-nalozi-zavrseni', component: NaloziZavrseniComponent },
  { path: 'evidencija', component: TransakcijeComponent },
  { path: 'kompanije', component: KompanijeComponent },
  { path: 'korisnici', component: KorisniciComponent },
  { path: 'login', component: LoginComponent },
];
