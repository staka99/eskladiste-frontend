import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { Company } from '../../model/company';
import { AuthService } from '../../service/auth.service';;
import { KompnaijaDijalogComponent } from '../../dijalozi/kompnaija-dijalog/kompnaija-dijalog.component';
import { CompanyService } from '../../service/company.service';

@Component({
  selector: 'app-kompanije',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './kompanije.component.html',
  styleUrl: './kompanije.component.css'
})
export class KompanijeComponent implements OnInit, OnDestroy{
  displayedColumns = ['rb', 'id', 'name', 'actions'];

  dataSource!:MatTableDataSource<Company>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:CompanyService, public authService:AuthService, public dialog:MatDialog){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
      this.subsription = this.service.getAllKompanije().subscribe({
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

  public openDialog(flag:number, id?:number, name?:string ) {
    const dialogRef = this.dialog.open(KompnaijaDijalogComponent, {data : { id, name}});
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
