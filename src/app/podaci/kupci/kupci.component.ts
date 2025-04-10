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

@Component({
  selector: 'app-kupci',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './kupci.component.html',
  styleUrl: './kupci.component.css'
})
export class KupciComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'naziv', 'adresa', 'postanskiBroj', 'grad', 'actions'];

  dataSource!:MatTableDataSource<Kupac>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:KupacService, public dialog:MatDialog){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
    this.subsription = this.service.getAllKupac().subscribe({
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

    public openDialog(flag:number, id?:number, naziv?:String, adresa?:String, postanskiBroj?:String, grad?:String ) {
      const dialogRef = this.dialog.open(KupacDijalogComponent, {data : { id, naziv, adresa, postanskiBroj, grad }});
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
