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
import { NalogDijalogComponent } from '../../dijalozi/nalog-dijalog/nalog-dijalog.component';
import { StavkaDijalogComponent } from '../../dijalozi/stavka-dijalog/stavka-dijalog.component';
import { Kupac } from '../../model/kupac';
import { Nalog } from '../../model/nalog';
import { Stavka } from '../../model/stavka';
import { NalogService } from '../../service/nalog.service';
import { StavkaService } from '../../service/stavka.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoVfs } from '../../../../public/vfs-fonts';

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

  displayedColumns = ['id', 'artikl', 'kolicina', 'actions'];

  dataSource!:MatTableDataSource<Stavka>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(
    public snackBar:MatSnackBar,
    public service:NalogService,
    public stavkaService:StavkaService,
    public dialog:MatDialog
  ) {}


  ngOnInit(): void {

    const companyIdStr = localStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.service.getZavrseniNalozi(companyId).subscribe((data) => {
        this.nalozi = data;
      });
      this.loadData();
    }
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
    doc.setTextColor('#333333'); // Tamno siva boja za kupca
    doc.text(`Kupac: ${this.nalog.kupac?.naziv}`, 14, y);
    y += 6;
    doc.text(`Adresa: ${this.nalog.kupac?.adresa}, ${this.nalog.kupac?.postanskiBroj} ${this.nalog.kupac?.grad}`, 14, y);
    y += 10;

    // --- PRIPREMA TABELU PODATAKA ---
    const tableData = this.dataSource.data.map((row, index) => [
      index + 1,
      `${row.sifra} - ${row.artikl}`,
      `${row.kolicina} ${row.jedinica}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['RB', 'Artikl', 'Količina']],
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
