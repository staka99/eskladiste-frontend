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
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.kupacService.getKupciByCompany(companyId).subscribe((data) => {
        this.kupci = data;
      });
      this.getKupci();
    }
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
    const company = this.getCompanyFromSessionStorage();
    if (!company) return;

    this.data.company = company;

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
    const company = this.getCompanyFromSessionStorage();
    if (!company) return;

    this.data.company = company;

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
    const company = this.getCompanyFromSessionStorage();
    if (!company) return;

    this.data.company = company;
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

              const company = this.getCompanyFromSessionStorage();
              if (!company) return;

              // Kreiranje novih transakcija
              const transakcija: Transakcija = {
                id: null,
                datum: new Date(),
                kolicina: stavka.kolicina,
                novoStanje: artikl.stanje,
                ulaz: 0,
                izlaz: stavka.cijena * stavka.kolicina,
                opis: `Izlaz po nalogu šifra: ${this.data.broj}, ${this.data.kupac?.naziv}`,
                artikl: stavka.sifra + " - " + stavka.artikl,
                jedinica: stavka.jedinica,
                company: company
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
    if (this.data.id) {
      this.stavkaService.getStavkeZaNalog(this.data.id).pipe(
        switchMap((stavke: any[]) => {
          if (!stavke || stavke.length === 0) {
            // Nema stavki → odmah briši nalog
            return this.service.deleteNalog(this.data.id!);
          } else {
            // Ima stavki → prvo briši sve stavke, pa onda nalog
            const deleteCalls = stavke.map(s => this.stavkaService.deleteStavka(s.id));
            return forkJoin(deleteCalls).pipe(
              switchMap(() => this.service.deleteNalog(this.data.id!))
            );
          }
        })
      ).subscribe({
        next: () => {
          this.snackBar.open(`Nalog i stavke su uspješno obrisani!`, `OK`, { duration: 2500 });
          this.dialogRef.close(1);
        },
        error: (error: Error) => {
          console.error('Greška prilikom brisanja:', error);
          this.snackBar.open(`Greška prilikom brisanja naloga ili stavki`, `OK`, { duration: 2500 });
        }
      });
    }
  }



  public cancel() {
    this.dialogRef.close();
    this.snackBar.open(`Odustali ste od ove aktivnosti!`, `OK`, {duration: 2500});
  }

  getKupci() {
    const companyIdStr = sessionStorage.getItem('company');
    const companyId = companyIdStr ? Number(companyIdStr) : null;

    if (companyId !== null && !isNaN(companyId)) {
      this.kupacService.getKupciByCompany(companyId).subscribe((kupci: Kupac[]) => {
        this.kupci = this.sortKupciByNaziv(kupci);
     });
    }

  }

  sortKupciByNaziv(kupci: Kupac[]): Kupac[] {
    return kupci.sort((a, b) => a.naziv.localeCompare(b.naziv));
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
