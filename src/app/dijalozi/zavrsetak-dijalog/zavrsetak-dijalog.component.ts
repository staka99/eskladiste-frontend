import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StanjeService } from '../../service/stanje.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Stanje } from '../../model/stanje';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-zavrsetak-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './zavrsetak-dijalog.component.html',
  styleUrl: './zavrsetak-dijalog.component.css',
    providers: [
      { provide: DateAdapter, useClass: NativeDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    ]
  })
export class ZavrsetakDijalogComponent {
 @Output() dataChanged = new EventEmitter<void>();
  flag!:number;

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Stanje>,
    @Inject (MAT_DIALOG_DATA) public data: Stanje,
    public service:StanjeService,
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

    this.service.addStanje(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Uspješno završen mjesečni unos!`, `OK`, {duration: 2500});
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

    this.service.updateStanje(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Podaci o mjesečnom presjeku su uspješno izmijenjeni!`, `OK`, {duration: 2500});
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
    this.service.deleteStanje(this.data.id!).subscribe({
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
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId === null) {
      console.error("Nema company ID u sessionStorage.");
      return null;
    }

    return {
      id: companyId,
      name: ""
    };
  }
}
