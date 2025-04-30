import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Company } from '../../model/company';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService } from '../../service/company.service';

@Component({
  selector: 'app-kompnaija-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './kompnaija-dijalog.component.html',
  styleUrl: './kompnaija-dijalog.component.css'
})
export class KompnaijaDijalogComponent {

  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Company>,
    @Inject (MAT_DIALOG_DATA) public data: Company,
    public service:CompanyService,
  ) {}

  public compare(a:any, b:any) {
    return a.id == b.id;
  }

  public onSubmit() {
    if (this.flag == 1) {
      this.add();
    } else if (this.flag == 2) {
      this.update();
    } else if (this.flag == 3) {
      this.delete();
    }
  }

  public add() {
    this.service.addKompanija(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Kompanija je uspješno dodata!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
        console.log(error.name + ' ' + error.message);
        this.snackBar.open(`Neuspješno dodavanje!`, `OK`, {duration: 2500});
    }
  }

  public update() {
    this.service.updateKompanija(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Podaci o kompaniji su uspješno izmijenjeni!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
      console.log("ee");
      console.log(error.name + ' ' + error.message);
      this.snackBar.open(`Neuspješna izmjena!`, `OK`, {duration: 2500});
    }
  }

  public delete() {
    this.service.deleteKompanija(this.data.id).subscribe({
      next: (data) => {
        this.snackBar.open(`Podaci su uspješno obrisani!`, `OK`, { duration: 2500 });
        this.dialogRef.close(1);
      },
      error: (error: Error) => {
        console.error('Greška prilikom brisanja:', error);
        this.snackBar.open(`Neuspješno brisanje`, `OK`, { duration: 2500 });
      },
    });
  }


  public cancel() {
    this.dialogRef.close();
    this.snackBar.open(`Odustali ste od ove aktivnosti!`, `OK`, {duration: 2500});
  }
}

