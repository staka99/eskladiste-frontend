import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nalog } from '../../model/nalog';
import { NalogService } from '../../service/nalog.service';
import { CommonModule } from '@angular/common';
import { StavkaService } from '../../service/stavka.service';
import { Stavka } from '../../model/stavka';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { StavkaDijalogComponent } from '../../dijalozi/stavka-dijalog/stavka-dijalog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-nalog',
  imports: [CommonModule, MatFormFieldModule, MatTableModule, MatToolbarModule,  MatIconModule, MatButtonModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatPaginatorModule, MatSortModule],
  templateUrl: './nalog.component.html',
  styleUrl: './nalog.component.css'
})
export class NalogComponent implements OnInit {

    nalozi!: Nalog[];
    nalog!: Nalog;
    stavke!: Stavka[];

    displayedColumns = ['id', 'artikl', 'kolicina', 'actions'];

    dataSource!:MatTableDataSource<Nalog>;
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
      this.service.getAllNalozi().subscribe((data) => {
        this.nalozi = data;
      });
      this.loadData();
    }

    public compare(a:any, b:any) {
      return a.id == b.id;
    }

    // -------------- 01 - Nalozi -----------------

    dodavanjeNaloga()  {

    }

    izmjenaNaloga() {

    }

    brisanjeNaloga() {

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

    public openDialogStavka(flag:number, id?:number, artikl?:String, kolicina?:number ) {
      const dialogRef = this.dialog.open(StavkaDijalogComponent, {data : { id, artikl, kolicina }});
         dialogRef.componentInstance.flag = flag;
         dialogRef.componentInstance.nalog = this.nalog;
         dialogRef.afterClosed().subscribe(
           (result) => {
             if(result==1) {
               this.loadData();
             }
           }
        )
    }

    dodavanjeArtikala() {

    }

    krajNaloga() {

    }
}
