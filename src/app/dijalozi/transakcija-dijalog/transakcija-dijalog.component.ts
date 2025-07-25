import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transakcija } from '../../model/transakcija';
import { TransakcijaService } from '../../service/transakcija.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MY_DATE_FORMATS } from '../artikl-dijalog/artikl-dijalog.component';

@Component({
  selector: 'app-transakcija-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './transakcija-dijalog.component.html',
  styleUrl: './transakcija-dijalog.component.css',
  providers: [DatePipe,
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
]
})
export class TransakcijaDijalogComponent {
  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Transakcija>,
    @Inject (MAT_DIALOG_DATA) public data: Transakcija,
    public service:TransakcijaService,
    private datePipe: DatePipe
  ) {}

  public compare(a:any, b:any) {
    return a.id == b.id;
  }

  public onSubmit() {
    if (this.flag == 3) {
      this.delete();
    }
  }

  get formattedDate(): string {
    return this.datePipe.transform(this.data.datum, 'dd/MM/yyyy') || '';
  }

 public update() {
  console.log(this.data);
  const company = this.getCompanyFromSessionStorage();
   if (!company) return;
  
  this.data.company = company;

  if (!this.data || !this.data.id) {
    console.error("Nedostaje ID transakcije za ažuriranje.");
    return;
  }

  this.service.updateTransakcija(this.data).subscribe({
    next: () => {
      this.snackBar.open("Transakcija je uspješno ažurirana!", "OK", { duration: 2500 });
      this.dialogRef.close(1); // vraća rezultat da bi se parent reloadovao
      console.log(this.data);
    },
    error: (error) => {
      console.error("Greška prilikom ažuriranja transakcije:", error);
      this.snackBar.open("Greška prilikom ažuriranja!", "OK", { duration: 2500 });
    }
  });
}


  public delete() {
    if(this.data.id) {
      this.service.deleteTransakcija(this.data.id).subscribe({
        next: (data) => {
          this.snackBar.open(`Podaci su uspješno obrisani!`, `OK`, { duration: 2500 });
          this.dialogRef.close(1);
        },
        error: (error: Error) => {
          console.error('Greška prilikom brisanja:', error);
          this.snackBar.open(`Neuspješno brisanje`, `OK`, { duration: 2500 });
        },
      });
    } else {
      console.log("Greška");
    }
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
