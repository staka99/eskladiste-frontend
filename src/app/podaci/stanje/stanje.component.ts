import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Stanje } from '../../model/stanje';
import { AuthService } from '../../service/auth.service';
import { StanjeService } from '../../service/stanje.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ZavrsetakDijalogComponent } from '../../dijalozi/zavrsetak-dijalog/zavrsetak-dijalog.component';

@Component({
  selector: 'app-stanje',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './stanje.component.html',
  styleUrl: './stanje.component.css'
})
export class StanjeComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'datum', 'stanje', 'actions'];

  dataSource!:MatTableDataSource<Stanje>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;


  constructor(private service:StanjeService, public authService:AuthService, public dialog:MatDialog){}

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
      this.subsription = this.service.getStanjaByCompany(companyId).subscribe({
next: (data) => {
  this.dataSource = new MatTableDataSource(data);
  this.dataSource.sort = this.sort;
  this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'datum':
        return item.datum instanceof Date ? item.datum : new Date(item.datum);
      default:
        return (item as any)[property];
    }
  };

  this.sort.active = 'datum';
  this.sort.direction = 'asc';
  this.dataSource.sort = this.sort;
}
,
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


  public openDialog(flag:number, id?:number, datum?:Date, stanje?:number ) {
    const dialogRef = this.dialog.open(ZavrsetakDijalogComponent, {data : { id, datum, stanje }});
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
