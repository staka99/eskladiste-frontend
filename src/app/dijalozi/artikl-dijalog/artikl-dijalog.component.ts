import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ArtiklService } from '../../service/artikl.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Artikl } from '../../model/artikl';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TransakcijaService } from '../../service/transakcija.service';
import { PomocnaTransakcija } from '../../model/pomocnaTransakcija';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { Transakcija } from '../../model/transakcija';

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
  selector: 'app-artikl-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './artikl-dijalog.component.html',
  styleUrl: './artikl-dijalog.component.css',
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class ArtiklDijalogComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;
  artikli!: Artikl[];
  selectedArtiklId: Artikl | null = null;
  selectedValue: string = '';

  public dataTransakcija: PomocnaTransakcija = {
    id: null,
    datum: new Date(),
    opis: "",
    artikl: new Artikl(),
    kolicina: null,
    novoStanje: null,
    jedinica: ""
  };

  public transakcija: Transakcija = {
    id: null,
    datum: new Date(),
    opis: "",
    artikl: "",
    kolicina: null,
    novoStanje: null,
    jedinica: ""
  };

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Artikl>,
    @Inject (MAT_DIALOG_DATA) public data: Artikl,
    @Inject (MAT_DIALOG_DATA) public dataTransakcijaInjected: Transakcija,
    public service:ArtiklService,
    public transakcijaService:TransakcijaService,
  ) {}

  ngOnInit(): void {
    this.service.getAllArtikli().subscribe((data) => {
      this.artikli = data;
    });
    this.getArtikli();
  }

  public compare(a:any, b:any) {
    return a.id == b.id;
  }

  public onSubmit() {
    if (this.flag == 1) {
      if(this.selectedValue === "option1") {
        this.ulazPostojece();
      } else if (this.selectedValue === "option2") {
        this.ulazNovo();
      }
    } else if (this.flag == 2) {
      this.otpis();
    } else if (this.flag == 3) {
      this.izmjena();
    } else if (this.flag == 4) {
      this.brisanje();
    }
  }

  public ulazNovo() {
    this.service.addArtikl(this.data).subscribe(
      (data) => {
        this.dataTransakcija.novoStanje = this.data.stanje;
        this.dataTransakcija.kolicina = this.data.stanje;
        this.dataTransakcija.artikl = data;

        this.transakcija.datum = this.dataTransakcija.datum;
        this.transakcija.opis = "Ulaz novog artikla: " + this.data.naziv + "; " + this.dataTransakcija.opis;
        this.transakcija.novoStanje = this.data.stanje;
        this.transakcija.kolicina = this.data.stanje;
        this.transakcija.artikl = this.data.sifra + " - " + this.data.naziv;
        this.transakcija.jedinica = this.data.jedinica;

        this.transakcijaService.addTransakcija(this.transakcija).subscribe(
          (data) => {
            this.snackBar.open(`Uspješno izvršeno dodavanje novog artikla!`, `OK`, { duration: 2500 });
            this.ngOnInit();
            this.dialogRef.close(1);
          },
          (error: Error) => {
            console.error(error);
            this.snackBar.open(`Greška prilikom upisa transakcije!`, `OK`, { duration: 2500 });
          }
        );
      },
      (error: Error) => {
        console.error(error);
        this.snackBar.open(`Dodavanje novog artikla nije bilo uspješno!`, `OK`, { duration: 2500 });
      }
    );
  }

  public ulazPostojece() {
    if (this.dataTransakcija.artikl && this.dataTransakcija.kolicina) {
      console.log(this.dataTransakcija.artikl);
      this.transakcija.datum = this.dataTransakcija.datum;
      this.transakcija.opis = "Ulaz artikla: " + this.dataTransakcija.opis;
      this.transakcija.novoStanje = this.dataTransakcija.artikl.stanje + this.dataTransakcija.kolicina;
      this.transakcija.kolicina = this.dataTransakcija.kolicina;
      this.transakcija.artikl = this.dataTransakcija.artikl.sifra + " - " + this.dataTransakcija.artikl.naziv;
      this.transakcija.jedinica = this.dataTransakcija.artikl.jedinica;

      this.transakcijaService.addTransakcija(this.transakcija).subscribe(
        (data) => {
          this.snackBar.open(`Uspješno izvršeno dodavanje!`, `OK`, { duration: 2500 });
          this.ngOnInit();
          this.dialogRef.close(1);

          if (this.dataTransakcija.kolicina != null && this.dataTransakcija.kolicina > 0) {
            this.updateArtiklStanjeUlaz(this.dataTransakcija.artikl.id, this.dataTransakcija.kolicina);
          } else {
            this.snackBar.open(`Neispravna količina za otpis`, `OK`, { duration: 2500 });
          }
        },
        (error: Error) => {
          console.error(error);
          this.snackBar.open(`Došlo je do greške!`, `OK`, { duration: 2500 });
        }
      );
    } else {
      this.snackBar.open(`Artikl ili količina nisu pravilno postavljeni`, `OK`, { duration: 2500 });
    }
  }

  private updateArtiklStanjeUlaz(artiklId: number, kolicina: number) {
    const artiklToUpdate = this.dataTransakcija.artikl || this.data;

    artiklToUpdate.stanje += kolicina;

    this.service.updateArtikl(artiklToUpdate).subscribe(
      (updatedArtikl) => {
        console.log("Artikl stanje uspešno ažurirano", updatedArtikl);
        this.ngOnInit();
      },
      (error: Error) => {
        console.error("Greška prilikom ažuriranja stanja artikla", error);
        this.snackBar.open(`Greška prilikom ažuriranja stanja artikla`, `OK`, {duration: 2500});
      }
    );
  }
  // ------------------------ 2 - otpis --------------------------------

  public otpis() {
    if (this.dataTransakcija.artikl && this.dataTransakcija.kolicina) {

      this.transakcija.datum = this.dataTransakcija.datum;
      this.transakcija.opis = "Otpis artikla zbog: " + this.dataTransakcija.opis;
      this.transakcija.novoStanje = this.dataTransakcija.artikl.stanje - this.dataTransakcija.kolicina;
      this.transakcija.kolicina = this.dataTransakcija.kolicina;
      this.transakcija.artikl = this.dataTransakcija.artikl.sifra + " - " + this.dataTransakcija.artikl.naziv;
      this.transakcija.jedinica = this.dataTransakcija.artikl.jedinica;

      this.transakcijaService.addTransakcija(this.transakcija).subscribe(
        (data) => {
          this.snackBar.open(`Uspješno izvršen otpis!`, `OK`, { duration: 2500 });
          this.ngOnInit();
          this.dialogRef.close(1);

          if (this.dataTransakcija.kolicina != null && this.dataTransakcija.kolicina > 0) {
            this.updateArtiklStanjeOtpis(this.dataTransakcija.artikl.id, this.dataTransakcija.kolicina);
          } else {
            this.snackBar.open(`Neispravna količina za otpis`, `OK`, { duration: 2500 });
          }
        },
        (error: Error) => {
          console.error(error);
          this.snackBar.open(`Došlo je do greške!`, `OK`, { duration: 2500 });
        }
      );
    } else {
      this.snackBar.open(`Artikl ili količina nisu pravilno postavljeni`, `OK`, { duration: 2500 });
    }
  }

  private updateArtiklStanjeOtpis(artiklId: number, kolicina: number) {
    const artiklToUpdate = this.dataTransakcija.artikl || this.data;

    artiklToUpdate.stanje -= kolicina;

    this.service.updateArtikl(artiklToUpdate).subscribe(
      (updatedArtikl) => {
        console.log("Artikl stanje uspešno ažurirano", updatedArtikl);
        this.ngOnInit();
      },
      (error: Error) => {
        console.error("Greška prilikom ažuriranja stanja artikla", error);
        this.snackBar.open(`Greška prilikom ažuriranja stanja artikla`, `OK`, {duration: 2500});
      }
    );
  }

  public stanjeNedostupno(): boolean {
    return this.dataTransakcija.artikl && this.dataTransakcija.artikl.stanje === 0;
  }

  public prekobrojnaKolicina(): boolean {
    const artikl = this.dataTransakcija.artikl;
    const kolicina = this.dataTransakcija.kolicina;

    if (!artikl || artikl.stanje == null || kolicina == null) {
      return false;
    }

    return kolicina > artikl.stanje;
  }

  getArtikli() {
    this.service.getAllArtikli().subscribe((artikli: Artikl[]) => {
      this.artikli = this.sortArtikliBySifra(artikli);
    });
  }

  sortArtikliBySifra(artikli: Artikl[]): Artikl[] {
    return artikli.sort((a, b) => a.sifra.localeCompare(b.sifra)); // Sortiranje po šifri
  }

  // ------------------------ 3 i 4 - izmjena i brisanje --------------------------------

  public izmjena() {
    this.service.updateArtikl(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Uspješno izmijenjen artikl!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
      console.log("ee");
      console.log(error.name + ' ' + error.message);
      this.snackBar.open(`Izmjena nije bila uspješna!`, `OK`, {duration: 2500});
    }
  }

  public brisanje() {
    this.service.deleteArtikl(this.data.id).subscribe({
      next: (data) => {
        this.snackBar.open(`Uspješno ste obrisali ovaj artikl!`, `OK`, { duration: 2500 });
        this.dialogRef.close(1);
      },
      error: (error: Error) => {
        console.error('Greška prilikom brisanja artikla:', error);
        this.snackBar.open(`Brisanje nije bilo uspješno!`, `OK`, { duration: 2500 });
      },
    });
  }

  public cancel() {
    this.dialogRef.close();
    this.snackBar.open(`Odustali ste od ove aktivnosti!`, `OK`, {duration: 2500});
  }

}
