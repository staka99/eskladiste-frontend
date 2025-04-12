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

@Component({
  selector: 'app-transakcije',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule, MatTooltipModule],
  templateUrl: './transakcije.component.html',
  styleUrl: './transakcije.component.css'
})
export class TransakcijeComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'datum', 'opis', 'artikl', 'kolicina', 'novoStanje', 'actions'];

  dataSource!:MatTableDataSource<Transakcija>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:TransakcijaService, public dialog:MatDialog){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
    this.subsription = this.service.getAllTransakcija().subscribe({
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

  public applyFilter(filter: any) {
    filter = filter.target.value;
    filter = filter.trim();
    filter = filter.toLocaleLowerCase();
    this.dataSource.filter = filter;
  }

    public openDialog(flag:number, id?:number, datum?:Date, opis?:String, artikl?:Artikl, kolicina?:number, novoStanje?:number ) {
      const dialogRef = this.dialog.open(TransakcijaDijalogComponent, {data : { id, datum, opis, artikl, kolicina, novoStanje }});
        dialogRef.componentInstance.flag = flag;
        dialogRef.afterClosed().subscribe(
          (result) => {
            if(result==1) {
              this.loadData();
            }
          }
        )
    }

}
