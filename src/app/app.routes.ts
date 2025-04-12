import { Routes } from '@angular/router';
import { KupciComponent } from './podaci/kupci/kupci.component';
import { SkladisteComponent } from './podaci/skladiste/skladiste.component';
import { TransakcijeComponent } from './podaci/transakcije/transakcije.component';
import { NalogComponent } from './podaci/nalog/nalog.component';
import { NaloziUIzradiComponent } from './podaci/nalozi-u-izradi/nalozi-u-izradi.component';
import { NaloziZavrseniComponent } from './podaci/nalozi-zavrseni/nalozi-zavrseni.component';

export const routes: Routes = [
  { path: '', redirectTo: 'skladiste', pathMatch: 'full' },
  { path: 'skladiste', component: SkladisteComponent },
  { path: 'kupci', component: KupciComponent },
  { path: 'radni-nalozi', component: NalogComponent },
  { path: 'radni-nalozi-u-izradi', component: NaloziUIzradiComponent },
  { path: 'radni-nalozi-zavrseni', component: NaloziZavrseniComponent },
  { path: 'evidencija', component: TransakcijeComponent },
];
