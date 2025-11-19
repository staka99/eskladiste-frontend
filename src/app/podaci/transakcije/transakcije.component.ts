import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { TransakcijaService } from '../../service/transakcija.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Artikl } from '../../model/artikl';
import { TransakcijaDijalogComponent } from '../../dijalozi/transakcija-dijalog/transakcija-dijalog.component';
import { Transakcija } from '../../model/transakcija';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoVfs } from '../../../../public/vfs-fonts';
import { AuthService } from '../../service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-transakcije',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule, MatTooltipModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './transakcije.component.html',
  styleUrl: './transakcije.component.css'
})
export class TransakcijeComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'datum', 'opis', 'artikl', 'kolicina', 'novoStanje', 'ulaz', 'izlaz', 'actions'];

  dataSource!:MatTableDataSource<Transakcija>;
  subsription!:Subscription;
  ukupanUlaz: number = 0;
  ukupanIzlaz: number = 0;

  months = [
    { name: 'Januar', value: 1 },
    { name: 'Februar', value: 2 },
    { name: 'Mart', value: 3 },
    { name: 'April', value: 4 },
    { name: 'Maj', value: 5 },
    { name: 'Jun', value: 6 },
    { name: 'Jul', value: 7 },
    { name: 'Avgust', value: 8 },
    { name: 'Septembar', value: 9 },
    { name: 'Oktobar', value: 10 },
    { name: 'Novembar', value: 11 },
    { name: 'Decembar', value: 12 }
  ];

  years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:TransakcijaService, public dialog:MatDialog, public authService:AuthService,){}

  ngOnInit(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1; // +1 jer getMonth() vraća 0–11
    this.selectedYear = today.getFullYear();
    this.loadData();
    this.izracunaj();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.subsription = this.service.getTransakcijaByCompany(companyId).subscribe({
        next: (data) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.izracunaj();
          setTimeout(() => {
          this.applyDateFilter();
          })
        },
        error: (error: Error) => {
          console.log(error.name + ' ' + error.message);
        }
      });
    }
  }


  public applyDateFilter() {
    this.dataSource.filterPredicate = (data: Transakcija, filter: string): boolean => {
      return this.customFilterPredicate(data, filter);
    };

    const filterValue = `${this.selectedMonth} ${this.selectedYear} ${this.dataSource.filter}`.toLowerCase();
    this.dataSource.filter = filterValue;

    this.izracunaj();
  }

customFilterPredicate(data: Transakcija, filter: string): boolean {
  if (!data.datum) return false;

  const transactionDate = new Date(data.datum);

  // Provera da li je datum validan
  if (isNaN(transactionDate.getTime())) return false;

  const transactionMonth = transactionDate.getMonth() + 1;
  const transactionYear = transactionDate.getFullYear();

  const monthMatches = this.selectedMonth === transactionMonth || this.selectedMonth === 0;
  const yearMatches = this.selectedYear === transactionYear || this.selectedYear === 0;

  return monthMatches && yearMatches;
}


  public openDialog(flag:number, id?:number, datum?:Date, opis?:String, artikl?:Artikl, kolicina?:number, novoStanje?:number, jedinica?:String, ulaz?:number, izlaz?:number ) {
    const dialogRef = this.dialog.open(TransakcijaDijalogComponent, {data : { id, datum, opis, artikl, kolicina, novoStanje, jedinica, ulaz, izlaz }});
      dialogRef.componentInstance.flag = flag;
      dialogRef.afterClosed().subscribe(
        (result) => {
          if(result==1) {
            this.loadData();
          }
        }
      )
  }

  izracunaj() {
    if (!this.dataSource || !this.dataSource.data) return;

    this.ukupanUlaz = this.dataSource.filteredData.reduce((sum, item) => {
      return sum + item.ulaz!;
    }, 0);

    this.ukupanIzlaz = this.dataSource.filteredData.reduce((sum, item) => {
      return sum + item.izlaz!;
    }, 0);

  }

  onDatumChange(row: Transakcija) {
  if (!row.id) {
    console.error('Transakcija nema ID!');
    return;
  }

  // Pretpostavljam da row.datum već ima novi datum (jer je vezan sa ngModel)
  this.service.updateTransakcija(row).subscribe({
    next: () => {
      console.log(`Datum transakcije ${row.id} je uspešno ažuriran.`);
      // Opcionalno:
      // this.loadData();  // osveži celu listu
    },
    error: (error) => {
      console.error('Greška prilikom ažuriranja datuma:', error);
    }
  });
}


    // ------------------------------ PDF
    exportToPDF() {
      const doc = new jsPDF();

      // 📅 Datum preuzimanja
      const today = new Date();
      const formattedDate = today.toLocaleDateString('sr-Latn-BA');

      // 🧾 Naslov
      doc.setFontSize(16);
      doc.text('Lista transakcija u skladištu', 14, 15);

      // 🗓️ Datum preuzimanja
      doc.setFontSize(10);
      doc.text(`Datum: ${formattedDate}`, 14, 22);

      // 📌 Odabrani mjesec i godina
      const mesecNaziv = this.months.find(m => m.value === this.selectedMonth)?.name || 'Svi mjeseci, ';
      const godina = this.selectedYear || 'Sve godine';
      doc.text(`Izveštaj za: ${mesecNaziv} ${godina}`, 14, 28);

      // 📊 Tabela
      const head = [['RB', 'Datum', 'Opis', 'Artikl', 'Količina', 'Novo stanje', 'Ulaz', 'Izlaz']];

      const sortedData = this.dataSource.filteredData.slice().sort((a, b) => {
        const dateA = a.datum ? new Date(a.datum).getTime() : 0;
        const dateB = b.datum ? new Date(b.datum).getTime() : 0;
        return dateA - dateB;
      });


      doc.addFileToVFS('Roboto-Regular.ttf', robotoVfs['Roboto-Regular.ttf']);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto', 'normal');

      const data = sortedData.map((transakcija, index) => [
        index + 1,
        new Date(transakcija.datum ? new Date(transakcija.datum).getTime() : 0).toLocaleDateString('sr-Latn-BA'),
        transakcija.opis || '',
        transakcija.artikl || '',
        transakcija.kolicina?.toString() || '0',
        transakcija.novoStanje?.toString() || '0',
        transakcija.ulaz !== undefined ? `${transakcija!.ulaz!.toFixed(2)} KM` : '0.00 KM',
        transakcija.izlaz !== undefined ? `${transakcija!.izlaz!.toFixed(2)} KM` : '0.00 KM'
      ]);

      autoTable(doc, {
        head: head,
        body: data,
        startY: 34,
        styles: {
          fontSize: 10,
          font: 'Roboto',
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          font: 'Roboto',
          fontSize: 10,
          fontStyle: 'normal',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
          font: 'Roboto',
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.2,
        theme: 'grid', // Koristi grid temu za bolje poravnanje ivica
      });

      const finalY = (doc as any).lastAutoTable.finalY || 34;

      // 🟫 Sivo polje - naziv "Ukupno ulaz"
      doc.setDrawColor(0);
      doc.setFillColor(230, 230, 230);
      doc.rect(14, finalY + 10, 60, 9, 'FD');
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.text('Ukupno ulaz:', 16, finalY + 16);

      // ⬜ Bijelo polje - iznos ulaza
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(74, finalY + 10, 40, 9, 'FD');
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.ukupanUlaz.toFixed(2)} KM`, 76, finalY + 16);

      // 🟫 Sivo polje - naziv "Ukupno izlaz" – odmah ispod ulaza
      doc.setDrawColor(0);
      doc.setFillColor(230, 230, 230);
      doc.rect(14, finalY + 19, 60, 9, 'FD');
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.text('Ukupno izlaz:', 16, finalY + 25);

      // ⬜ Bijelo polje - iznos izlaza
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.rect(74, finalY + 19, 40, 9, 'FD');
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.ukupanIzlaz.toFixed(2)} KM`, 76, finalY + 25);



      const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor('#666666');
          doc.text(`Strana ${i}/${pageCount}`, 200, 290, { align: 'right' });
        }


      const fileName = `skladiste_evidencija_${formattedDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    }



}
