import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Transakcija } from '../../model/transakcija';
import { TransakcijaService } from '../../service/transakcija.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';

interface KalkulacijaRow {
  mjesec: string;
  stanjePrethodni: number;
  ulaz: number;
  kalkulacija: number;
  izlaz: number;
  ukupno: number;
}

@Component({
  selector: 'app-kalkulacija',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './kalkulacija.component.html',
  styleUrl: './kalkulacija.component.css'
})
export class KalkulacijaComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['mjesec', 'stanjePrethodni', 'ulaz', 'kalkulacija', 'izlaz', 'ukupno'];
  dataSource = new MatTableDataSource<KalkulacijaRow>();

  subscription!: Subscription;
  months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  constructor(private service: TransakcijaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadData() {
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.subscription = this.service.getTransakcijaByCompany(companyId).subscribe({
        next: (transakcije) => {
          this.dataSource.data = this.izracunajKalkulacije(transakcije);
        },
        error: (err) => console.error(err)
      });
    }
  }

izracunajKalkulacije(transakcije: Transakcija[]): KalkulacijaRow[] {
  if (!transakcije) return [];

  // 🔹 Filtriramo samo transakcije od jula 2025. pa nadalje
  const filtrirane = transakcije.filter(t => {
    if (!t.datum) return false;
    const d = new Date(t.datum);
    return d.getFullYear() > 2025 || (d.getFullYear() === 2025 && d.getMonth() >= 6); // juli = 6
  });

  const grupisano = new Map<string, Transakcija[]>();

filtrirane.forEach(t => {
  if (!t.datum) return; // opet, dodatna provjera da TS ne kuka
  const d = new Date(t.datum);
  const key = `${d.getFullYear()}-${d.getMonth()}`; 
  if (!grupisano.has(key)) grupisano.set(key, []);
  grupisano.get(key)!.push(t);
});


  const sortirani = Array.from(grupisano.keys()).sort((a, b) => {
    const [godA, mjA] = a.split('-').map(Number);
    const [godB, mjB] = b.split('-').map(Number);
    return godA === godB ? mjA - mjB : godA - godB;
  });

  let prethodnoStanje = 111458.51; // početno stanje za jul 2025.

  const result: KalkulacijaRow[] = [];

  sortirani.forEach(key => {
    const mjesecTrans = grupisano.get(key)!;
    const ulaz = mjesecTrans.reduce((s, t) => s + (t.ulaz || 0), 0);
    const izlaz = mjesecTrans.reduce((s, t) => s + (t.izlaz || 0), 0);
    const kalkulacija = prethodnoStanje + ulaz;
    const ukupno = kalkulacija - izlaz;

    const [god, mjesecIdx] = key.split('-').map(Number);
    const mjesecNaziv = `${this.months[mjesecIdx]} ${god}`;

    result.push({
      mjesec: mjesecNaziv,
      stanjePrethodni: prethodnoStanje,
      ulaz,
      kalkulacija,
      izlaz,
      ukupno
    });

    prethodnoStanje = ukupno;
  });

  return result;
}


}