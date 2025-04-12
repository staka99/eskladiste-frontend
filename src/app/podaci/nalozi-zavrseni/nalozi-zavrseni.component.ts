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
    this.service.getZavrseniNalozi().subscribe((data) => {
      this.nalozi = data;
    });
    this.loadData();
  }

  public compare(a:any, b:any) {
    return a.id == b.id;
  }

  // -------------- 01 - Nalozi -----------------

  public openDialogNalog(flag:number, id?:number, broj?:String, kupac?:Kupac ) {
    const dialogRef = this.dialog.open(NalogDijalogComponent, {data : { id, broj, kupac }});
       dialogRef.componentInstance.flag = flag;
       dialogRef.afterClosed().subscribe(
         (result) => {
          if (result === 1) {
            // osvežavanje rezultata za prikaz
            if(flag===1) {
              this.service.getZavrseniNalozi().subscribe((data) => {
                this.nalozi = data;

                // Pretpostavka: poslednji je najnoviji
                this.nalog = this.nalozi[this.nalozi.length - 1];
                this.loadData();
              });
            }

            this.service.getZavrseniNalozi().subscribe((data) => {
              this.nalozi = data;

              if (this.nalog?.id) {
                this.nalog = this.nalozi.find(n => n.id === this.nalog.id)!;
                this.loadData();
              }
            });
          }
        });
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

  public openDialogStavka(flag:number, id?:number, sifra?:String, artikl?:String, kolicina?:number ) {
    const dialogRef = this.dialog.open(StavkaDijalogComponent, {data : { id, sifra, artikl, kolicina }});
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

}
