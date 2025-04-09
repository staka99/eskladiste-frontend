import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Artikl } from '../../model/artikl';
import { ArtiklService } from '../../service/artikl.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ArtiklComponent } from '../../dijalozi/artikl/artikl.component';

@Component({
  selector: 'app-skladiste',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './skladiste.component.html',
  styleUrl: './skladiste.component.css'
})
export class SkladisteComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'sifra', 'naziv', 'jedinica', 'stanje', 'actions'];

  dataSource!:MatTableDataSource<Artikl>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:ArtiklService, public dialog:MatDialog){}

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
    const dialogRef = this.dialog.open(ArtiklComponent, {data : { id, sifra, naziv, jedinica, stanje }});
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
