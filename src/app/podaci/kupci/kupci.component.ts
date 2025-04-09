import { Component, OnDestroy, OnInit } from '@angular/core';
import { KupacService } from '../../service/kupac.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Kupac } from '../../model/kupac';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-kupci',
  imports: [CommonModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './kupci.component.html',
  styleUrl: './kupci.component.css'
})
export class KupciComponent implements OnInit, OnDestroy{
  displayedColumns = ['id', 'naziv', 'adresa', 'postanskiBroj', 'grad', 'actions'];

  dataSource!:MatTableDataSource<Kupac>;
  subsription!:Subscription;

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
        console.log(data);
      },
      error: (error: Error) => {
        console.log(error.name + ' ' + error.message);
        console.log("NSUPJEŠNO");
      }
    });
  }

}
