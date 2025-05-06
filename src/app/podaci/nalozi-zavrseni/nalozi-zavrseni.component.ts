import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { Nalog } from '../../model/nalog';
import { Stavka } from '../../model/stavka';
import { NalogService } from '../../service/nalog.service';
import { StavkaService } from '../../service/stavka.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoVfs } from '../../../../public/vfs-fonts';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-nalozi-zavrseni',
  imports: [CommonModule, MatFormFieldModule, MatTableModule, MatToolbarModule, MatTooltipModule, MatIconModule, MatButtonModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatPaginatorModule, MatSortModule],
  templateUrl: './nalozi-zavrseni.component.html',
  styleUrl: './nalozi-zavrseni.component.css'
})
export class NaloziZavrseniComponent implements OnInit {

  nalozi!: Nalog[];
  nalog!: Nalog;
  stavke!: Stavka[];

  displayedColumns = ['id', 'artikl', 'kolicina', 'cijena', 'vrijednost', 'actions'];

  dataSource!:MatTableDataSource<Stavka>;
  subsription!:Subscription;
  ukupno: number = 0;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(
    public snackBar:MatSnackBar,
    public service:NalogService,
    public stavkaService:StavkaService,
    public authService:AuthService,
    public dialog:MatDialog
  ) {}


  ngOnInit(): void {

    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.service.getZavrseniNalozi(companyId).subscribe((data) => {
        this.nalozi = data;
      });
      this.loadData();
    }
    this.izracunaj();
  }

  public compare(a:any, b:any) {
    return a.id == b.id;
  }


  // -------------- 02 - Stavke -----------------
  public loadData() {
    if(this.nalog.id) {
      this.subsription = this.stavkaService.getStavkeZaNalog(this.nalog.id).subscribe({
        next: (data) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.izracunaj();
        },
        error: (error: Error) => {
          console.log(error.name + ' ' + error.message);
        }
      });
    }
  }

  public applyFilter(filter: any) {
    filter = filter.target.value;
    filter = filter.trim();
    filter = filter.toLocaleLowerCase();
    this.dataSource.filter = filter;
  }

  izracunaj() {
    if (!this.dataSource || !this.dataSource.data) return;

    this.ukupno = this.dataSource.filteredData.reduce((sum, item) => {
      return sum + item.cijena! * item.kolicina!;
    }, 0);
  }

  exportToPDF() {
    const doc = new jsPDF();

    // --- MODERNO ZAGLAVLJE U SIVIM TONOVIMA ---
    doc.setFillColor('#eeeeee'); // svetlo siva pozadina
    doc.rect(0, 0, 210, 30, 'F'); // Pozadina

    doc.addFileToVFS('Roboto-Regular.ttf', robotoVfs['Roboto-Regular.ttf']);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto', 'normal');

    // Glavni tekst u zaglavlju
    doc.setFontSize(22); // Veći font za broj računa
    doc.setTextColor('#333333'); // Tamno siva boja za tekst
    doc.text('RADNI NALOG', 14, 18);

    // Podaci u zaglavlju (Broj i Datum)
    doc.setTextColor('#666666'); // Siva boja za sekundarne podatke
    doc.setFontSize(16);
    doc.text(`Broj: ${this.nalog.broj}`, 150, 14);
    doc.setFontSize(10);
    // Datum u formatu dd.mm.yyyy
    doc.text(`Datum: ${new Date(this.nalog.datum).toLocaleDateString('sr-RS')}`, 150, 22);

      // --- PODACI ISPOD ZAGLAVLJA ---
      let y = 40;
      doc.setFontSize(12);

      // Kupac
      doc.setTextColor('#333333');
      doc.text('Kupac:', 14, y);
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.nalog.kupac?.naziv}`, 40, y);
      doc.setFont('Roboto', 'normal');
      y += 6;

      // JIB
      doc.text('JIB:', 14, y);
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.nalog.kupac?.jib || ''}`, 40, y);
      doc.setFont('Roboto', 'normal');
      y += 6;

      // Adresa
      doc.text('Adresa:', 14, y);
      doc.setFont('Roboto', 'normal');
      doc.text(`${this.nalog.kupac?.adresa}, ${this.nalog.kupac?.postanskiBroj} ${this.nalog.kupac?.grad}`, 40, y);
      doc.setFont('Roboto', 'normal');
      y += 10;



    // --- PRIPREMA TABELU PODATAKA ---
    const tableData = this.dataSource.data.map((row, index) => [
      index + 1,
      `${row.sifra} - ${row.artikl}`,
      `${row.kolicina} ${row.jedinica}`,
      `${row.cijena?.toFixed(2)}`, // Cijena na 2 decimale
      `${((row.cijena ?? 0) * (row.kolicina ?? 0)).toFixed(2)}` // Vrijednost = cijena * kolicina
    ]);

    autoTable(doc, {
      startY: y,
      head: [['RB', 'Artikl', 'Količina', 'Cijena', 'Vrijednost']],
      body: tableData,
      styles: {
        halign: 'left', // Poravnavanje levo
        valign: 'middle', // Poravnavanje vertikalno
        font: 'Roboto',
        fontStyle: 'normal',
        lineWidth: 0.1, // Tanjih linija
        lineColor: [0, 0, 0], // Crna boja za linije
      },
      headStyles: {
        fillColor: [211, 211, 211], // Svetlo siva boja za pozadinu zaglavlja
        textColor: [51, 51, 51], // Tamno siva boja za tekst
        fontSize: 10,
        font: 'Roboto',
        fontStyle: 'normal',
        lineWidth: 0.1, // Tanjih linija za zaglavlje
        lineColor: [0, 0, 0], // Crna boja za linije
        cellPadding: 5, // Dodavanje padding-a u celijama
        minCellHeight: 8, // Minimalna visina ćelije za bolji izgled
        halign: 'center', // Centriranje teksta u zaglavlju
        valign: 'middle',
        //borderRadius: 5, // Zaobljeni kutovi zaglavlja
      },
      bodyStyles: {
        fontSize: 10,
        font: 'Roboto',
        fontStyle: 'normal',
        lineWidth: 0.1, // Tanjih linija za telo tabele
        lineColor: [0, 0, 0], // Crna boja linija
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Svetlo siva boja za naizmenične redove
      },
      theme: 'grid', // Koristi grid temu za bolje poravnanje ivica
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Dimenzije
    const startX = 14;
    const cellHeight = 8;
    const leftCellWidth = 40;
    const rightCellWidth = 40;

    // Font i boje
    doc.setFontSize(10);
    doc.setDrawColor(0); // crna linija
    doc.setFillColor(230, 230, 230); // svijetlosiva

    // Leva ćelija (Ukupno)
    doc.rect(startX, finalY, leftCellWidth, cellHeight, 'FD'); // Fill + Draw
    doc.setTextColor(0, 0, 0);
    doc.text('Ukupno:', startX + 2, finalY + 5);

    // Desna ćelija (Iznos)
    doc.setFillColor(255, 255, 255); // bijela
    doc.rect(startX + leftCellWidth, finalY, rightCellWidth, cellHeight, 'FD');
    doc.text(`${this.ukupno.toFixed(2)} KM`, startX + leftCellWidth + 2, finalY + 5);


    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor('#666666');
      doc.text(`Strana ${i}/${pageCount}`, 200, 290, { align: 'right' });
    }

    // --- SAČUVAJ PDF ---
    doc.save(`radni_nalog_${this.nalog.broj}.pdf`);
  }


}
