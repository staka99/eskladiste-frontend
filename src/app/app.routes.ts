import { Routes } from '@angular/router';
import { KupciComponent } from './podaci/kupci/kupci.component';
import { SkladisteComponent } from './podaci/skladiste/skladiste.component';
import { TransakcijeComponent } from './podaci/transakcije/transakcije.component';

export const routes: Routes = [
  { path: '', redirectTo: 'skladiste', pathMatch: 'full' },
  { path: 'skladiste', component: SkladisteComponent },
  { path: 'kupci', component: KupciComponent },
  { path: 'transakcije', component: TransakcijeComponent },
];
