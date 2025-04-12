import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { Artikl } from '../../model/artikl';
import { ArtiklService } from '../../service/artikl.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArtiklDijalogComponent } from '../../dijalozi/artikl-dijalog/artikl-dijalog.component';
import { StavkaService } from '../../service/stavka.service';
import { Stavka } from '../../model/stavka';
import { MatTooltipModule } from '@angular/material/tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoVfs } from '../../../../public/vfs-fonts';
@Component({
  selector: 'app-skladiste',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './skladiste.component.html',
  styleUrl: './skladiste.component.css'
})
export class SkladisteComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'sifra', 'naziv', 'jedinica', 'stanje', 'actions'];

  dataSource!:MatTableDataSource<Artikl>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:ArtiklService, public dialog:MatDialog, public stavkaService:StavkaService){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
    this.subsription = this.service.getAllArtikli().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.dataSource.data.forEach(artikl => {
          this.artiklUNalogu(artikl).subscribe((imaAktivnih) => {
            artikl.imaAktivnihStavki = imaAktivnih;
          });
        });
      },
      error: (error: Error) => {
        console.log(error.name + ' ' + error.message);
      }
    });
  }

  public applyFilter(filter: any) {
    filter = filter.target.value;
    filter = filter.trim();
    filter = filter.toLocaleLowerCase();
    this.dataSource.filter = filter;
  }

  public openDialog(flag:number, id?:number, sifra?:String, naziv?:String, jedinica?:String, stanje?:number ) {
    const dialogRef = this.dialog.open(ArtiklDijalogComponent, {data : { id, sifra, naziv, jedinica, stanje }});
      dialogRef.componentInstance.flag = flag;
      dialogRef.afterClosed().subscribe(
        (result) => {
          if(result==1) {
            this.loadData();
          }
        }
      )
  }

  public artiklUNalogu(artikl: Artikl): Observable<boolean> {
    return this.stavkaService.getBySifra(artikl.sifra).pipe(
      map((stavke: Stavka[]) => {
        return stavke.some(stavka => !stavka.nalog.zavrsen);
      }),
      catchError(err => {
        return of(false);
      })
    );
  }



  // ------------------------------ PDF
  exportToPDF() {
    const doc = new jsPDF();

    // 📅 Datum preuzimanja
    const today = new Date();
    const formattedDate = today.toLocaleDateString('sr-Latn-BA');

    // 🧾 Naslov
    doc.setFontSize(16);
    doc.text('Stanje skladišta', 14, 15);

    // 🗓️ Datum
    doc.setFontSize(10);
    doc.text(`Datum: ${formattedDate}`, 14, 22);

    // 📊 Podaci
    const head = [['RB', 'Šifra', 'Naziv', 'Jedinica mjere', 'Stanje']];

    const sortedData = this.dataSource.data.slice().sort((a, b) => {
      return a.sifra.localeCompare(b.sifra); // ako je šifra string
    });

    doc.addFileToVFS('Roboto-Regular.ttf', robotoVfs['Roboto-Regular.ttf']);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto', 'normal');

    const data = sortedData.map((artikl, index) => [
      index + 1,
      artikl.sifra,
      artikl.naziv,
      artikl.jedinica,
      artikl.stanje.toString()
    ]);

    autoTable(doc, {
            head: head,
            body: data,
            startY: 28,
            styles: {
                fontSize: 10,
                font: 'Roboto', // Postavljanje fonta za telo tabele
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
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor('#666666');
      doc.text(`Strana ${i}/${pageCount}`, 200, 290, { align: 'right' });
    }

    const fileName = `skladiste_stanje_${formattedDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }


}
