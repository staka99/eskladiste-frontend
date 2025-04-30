import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription } from 'rxjs';
import { robotoVfs } from '../../../../public/vfs-fonts';
import { User } from '../../model/user';
import { UserService } from '../../service/user.service';
import { UserDijalogComponent } from '../../dijalozi/user-dijalog/user-dijalog.component';
import { Company } from '../../model/company';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-korisnici',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule],
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.css'
})
export class KorisniciComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'username', 'password', 'company', 'role', 'actions'];

  dataSource!:MatTableDataSource<User>;
  subsription!:Subscription;

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private service:UserService, public authService:AuthService, public dialog:MatDialog){}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  public loadData() {
      this.subsription = this.service.getAllUsers().subscribe({
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

  public openDialog(flag:number, id?:number, username?:string, password?:number, company?:Company, role?:string ) {
    const dialogRef = this.dialog.open(UserDijalogComponent, {data : { id, username, password, company, role}});
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
