import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Nalog } from '../../model/nalog';
import { NalogService } from '../../service/nalog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { KupacService } from '../../service/kupac.service';
import { Kupac } from '../../model/kupac';
import { StavkaService } from '../../service/stavka.service';
import { Transakcija } from '../../model/transakcija';
import { TransakcijaService } from '../../service/transakcija.service';
import { ArtiklService } from '../../service/artikl.service';
import { Artikl } from '../../model/artikl';

@Component({
  selector: 'app-nalog-dijalog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nalog-dijalog.component.html',
  styleUrl: './nalog-dijalog.component.css'
})
export class NalogDijalogComponent implements OnInit{
  @Output() dataChanged = new EventEmitter<void>();
  flag!:number;
  kupci!: Kupac[];

  constructor(
    public snackBar:MatSnackBar,
    public dialogRef:MatDialogRef<Nalog>,
    @Inject (MAT_DIALOG_DATA) public data: Nalog,
    public service:NalogService,
    public kupacService:KupacService,
    public stavkaService:StavkaService,
    public transakcijaService: TransakcijaService,
    public artiklService: ArtiklService,
  ) {}

  ngOnInit(): void {
    this.kupacService.getAllKupac().subscribe((data) => {
      this.kupci = data;
    });
    this.getKupci();
  }

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
    this.service.addNalog(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Nalog je uspješno dodat!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
        console.log(error.name + ' ' + error.message);
        this.snackBar.open(`Neuspješno dodavanje!`, `OK`, {duration: 2500});
    }
  }

  public update() {
    this.service.updateNalog(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Podaci o nalogu su uspješno izmijenjeni!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
      }
    ),
    (error:Error) => {
      console.log("ee");
      console.log(error.name + ' ' + error.message);
      this.snackBar.open(`Neuspješna izmjena!`, `OK`, {duration: 2500});
    }
  }

  public zavrsi() {
    console.log(this.data);
    this.data.zavrsen = true;
    this.data.datum = new Date();
    this.service.updateNalog(this.data).subscribe(
      (data) => {
        this.snackBar.open(`Nalog je uspješno završen!`, `OK`, {duration: 2500});
        this.dialogRef.close(1);
        this.stavkeUTransakcije(this.data.id!);
      }
    ),
    (error:Error) => {
      console.log(error.name + ' ' + error.message);
      this.snackBar.open(`Neuspješna izmjena!`, `OK`, {duration: 2500});
    }
  }

  public stavkeUTransakcije(id:number) {
    this.stavkaService.getStavkeZaNalog(id).subscribe(
      (stavke) => {
        stavke.forEach((stavka: any) => {

          // Preuzimanje novog Stanja iz artikla
          this.artiklService.getBySifra(stavka.sifra).subscribe({
            next: (artikli: Artikl[]) => {
              const artikl = artikli[0];

              if (!artikl) {
                this.snackBar.open(`Artikl nije pronađen`, `OK`, { duration: 2500 });
                return;
              }

              // Kreiranje novih transakcija
              const transakcija: Transakcija = {
                id: null,
                datum: new Date(),
                kolicina: stavka.kolicina,
                novoStanje: artikl.stanje,
                opis: `Izlaz po nalogu šifra: ${this.data.broj}, ${this.data.kupac?.naziv}`,
                artikl: stavka.sifra + " - " + stavka.artikl,
                jedinica: stavka.jedinica
              };

              // Slanje transakcije u backend
              this.transakcijaService.addTransakcija(transakcija).subscribe(
                () => console.log(`Transakcija dodata za artikl: ${transakcija.artikl}`),
                (err: Error) => console.error(`Greška prilikom dodavanja transakcije: ${err.message}`)
              );
            },
            error: (error: Error) => {
              console.error('Greška prilikom dohvaćanja artikla:', error);
              this.snackBar.open(`Artikl nije pronađen`, `OK`, { duration: 2500 });
            }
          });

        });
      },
      (err: Error) => {
        console.error(`Greška prilikom preuzimanja stavki: ${err.message}`);
      }
    );
  }

  public delete() {
    if(this.data.id) {
      this.service.deleteNalog(this.data.id).subscribe({
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

  getKupci() {
    this.kupacService.getAllKupac().subscribe((kupci: Kupac[]) => {
       this.kupci = this.sortKupciByNaziv(kupci);
    });
  }

  sortKupciByNaziv(kupci: Kupac[]): Kupac[] {
    return kupci.sort((a, b) => a.naziv.localeCompare(b.naziv));
  }
}
