import { StavkaService } from './../../service/stavka.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Stavka } from '../../model/stavka';
import { ArtiklService } from '../../service/artikl.service';
import { Artikl } from '../../model/artikl';
import { PomocnaStavka } from '../../model/pomocnaStavka';
import { Nalog } from '../../model/nalog';

@Component({
  selector: 'app-stavka-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stavka-dijalog.component.html',
  styleUrl: './stavka-dijalog.component.css'
})
export class StavkaDijalogComponent {
  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;
  nalog!:Nalog;
  artikli!: Artikl[];


  public dataStavka: PomocnaStavka = {
    id: null,
    nalog: new Nalog(),
    artikl: new Artikl(),
    kolicina: null,
    jedinica: ""
  };

  public stavka: Stavka = {
    id: null,
    nalog: new Nalog(),
    artikl: "",
    kolicina: null,
    jedinica: ""
  };


  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Stavka>,
    @Inject (MAT_DIALOG_DATA) public data: Stavka,
    public service:StavkaService,
    public artiklService:ArtiklService
  ) {}

  ngOnInit(): void {
    this.artiklService.getAllArtikli().subscribe((data) => {
      this.artikli = data;
    });
    this.getArtikli();
  }

  public compare(a:any, b:any) {
    return a.id == b.id;
  }

  public onSubmit() {
    if (this.flag == 1) {
      this.add();
    } else if (this.flag == 3) {
      this.delete();
    }
  }

  public add() {
    if (this.dataStavka.artikl && this.dataStavka.kolicina) {
      console.log(this.dataStavka.artikl);
      this.stavka.artikl = this.dataStavka.artikl.sifra + " - " + this.dataStavka.artikl.naziv;
      this.stavka.kolicina = this.dataStavka.kolicina;
      this.stavka.jedinica = this.dataStavka.artikl.jedinica;
      this.stavka.nalog = this.nalog;

      console.log(this.stavka);

      this.service.addStavka(this.stavka).subscribe(
        (data) => {
          this.snackBar.open(`Uspješno izvršeno dodavanje!`, `OK`, { duration: 2500 });
          this.ngOnInit();
          this.dialogRef.close(1);

          if (this.dataStavka.kolicina != null && this.dataStavka.kolicina > 0) {
            this.updateArtiklIzlaz(this.dataStavka.artikl.id, this.dataStavka.kolicina);
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

  private updateArtiklIzlaz(artiklId: number, kolicina: number) {
    const artiklToUpdate = this.dataStavka.artikl || this.data;

    artiklToUpdate.stanje -= kolicina;

    this.artiklService.updateArtikl(artiklToUpdate).subscribe(
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


  // -------------------- brisanje -----------------------------

  public delete() {
    if(this.data.id) {
      this.service.deleteStavka(this.data.id).subscribe({
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
  }

  public cancel() {
    this.dialogRef.close();
    this.snackBar.open(`Odustali ste od ove aktivnosti!`, `OK`, {duration: 2500});
  }


  // -------------------- artikli -----------------------------

  getArtikli() {
    this.artiklService.getAllArtikli().subscribe((artikli: Artikl[]) => {
      this.artikli = this.sortArtikliBySifra(artikli);
    });
  }

  sortArtikliBySifra(artikli: Artikl[]): Artikl[] {
    return artikli.sort((a, b) => a.sifra.localeCompare(b.sifra)); // Sortiranje po šifri
  }

  public stanjeNedostupno(): boolean {
    return this.dataStavka.artikl && this.dataStavka.artikl.stanje === 0;
  }

  public prekobrojnaKolicina(): boolean {
    const artikl = this.dataStavka.artikl;
    const kolicina = this.dataStavka.kolicina;

    if (!artikl || artikl.stanje == null || kolicina == null) {
      return false;
    }

    return kolicina > artikl.stanje;
  }
}
