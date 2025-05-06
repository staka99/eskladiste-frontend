import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Kupac } from '../../model/kupac';
import { KupacService } from '../../service/kupac.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-kupac-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './kupac-dijalog.component.html',
  styleUrl: './kupac-dijalog.component.css'
})
export class KupacDijalogComponent {
  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Kupac>,
    @Inject (MAT_DIALOG_DATA) public data: Kupac,
    public service:KupacService,
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
  const company = this.getCompanyFromSessionStorage();
  if (!company) return;

  this.data.company = company;

    this.service.addKupac(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Kupac je uspješno dodat!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
        console.log(error.name + ' ' + error.message);
        this.snackBar.open(`Neuspješno dodavanje!`, `OK`, {duration: 2500});
    }
  }

  public update() {
  const company = this.getCompanyFromSessionStorage();
  if (!company) return;

  this.data.company = company;

    this.service.updateKupac(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Podaci o kupcu su uspješno izmijenjeni!`, `OK`, {duration: 2500});
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
    this.service.deleteKupac(this.data.id).subscribe({
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

  private getCompanyFromSessionStorage(): { id: number, name: string } | null {
    const companyIdStr = localStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId === null) {
      console.error("Nema company ID u localStorage.");
      return null;
    }

    return {
      id: companyId,
      name: ""
    };
  }

}
