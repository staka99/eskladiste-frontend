import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KupacService } from '../../service/kupac.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Kupac } from '../../model/kupac';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { KupacDijalogComponent } from '../../dijalozi/kupac-dijalog/kupac-dijalog.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoVfs } from '../../../../public/vfs-fonts';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-kupci',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './kupci.component.html',
  styleUrl: './kupci.component.css'
})
export class KupciComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'naziv', 'jib', 'adresa', 'postanskiBroj', 'grad', 'actions'];

  dataSource!:MatTableDataSource<Kupac>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:KupacService, public authService:AuthService, public dialog:MatDialog){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.subsription = this.service.getKupciByCompany(companyId).subscribe({
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

    public openDialog(flag:number, id?:number, naziv?:String, jib?:String, adresa?:String, postanskiBroj?:String, grad?:String ) {
      const dialogRef = this.dialog.open(KupacDijalogComponent, {data : { id, naziv, jib, adresa, postanskiBroj, grad }});
        dialogRef.componentInstance.flag = flag;
        dialogRef.afterClosed().subscribe(
          (result) => {
            if(result==1) {
              this.loadData();
            }
          }
        )
    }

      // ------------------------------ PDF
      exportToPDF() {
        const doc = new jsPDF();

        // 📅 Datum preuzimanja
        const today = new Date();
        const formattedDate = today.toLocaleDateString('sr-Latn-BA');

        // 📊 Podaci
        const head = [['RB', 'Naziv', 'JIB', 'Adresa', "Poštanski broj", "Grad"]];

        doc.addFileToVFS('Roboto-Regular.ttf', robotoVfs['Roboto-Regular.ttf']);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto', 'normal');

        // 🧾 Naslov
        doc.setFontSize(16);
        doc.text('Kupci', 14, 15);

        // 🗓️ Datum
        doc.setFontSize(10);
        doc.text(`Datum: ${formattedDate}`, 14, 22);

        // Sortiranje podataka
        const sortedData = this.dataSource.data.slice().sort((a, b) => {
            return a.naziv.localeCompare(b.naziv);
        });

        const data = sortedData.map((kupci, index) => [
            index + 1,
            kupci.naziv,
            kupci.jib,
            kupci.adresa,
            kupci.postanskiBroj,
            kupci.grad
        ]);

        // Primena autoTable
        autoTable(doc, {
            head: head,
            body: data,
            startY: 28,
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
        });

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor('#666666');
          doc.text(`Strana ${i}/${pageCount}`, 200, 290, { align: 'right' });
        }

        // Spremanje PDF-a
        const fileName = `kupci_${formattedDate.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    }







}
