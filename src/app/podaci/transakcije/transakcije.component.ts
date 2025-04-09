import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { TransakcijaService } from '../../service/transakcija.service';
import { Transakcija } from '../../model/transakcija';

@Component({
  selector: 'app-transakcije',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './transakcije.component.html',
  styleUrl: './transakcije.component.css'
})
export class TransakcijeComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'datum', 'opis', 'artikl', 'kolicina', 'actions'];

  dataSource!:MatTableDataSource<Transakcija>;
  subsription!:Subscription;

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
        console.log(data);
      },
      error: (error: Error) => {
        console.log(error.name + ' ' + error.message);
      }
    });
  }

  
}
