import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from '../../model/company';
import { User } from '../../model/user';
import { UserService } from '../../service/user.service';
import { CompanyService } from '../../service/company.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-dijalog.component.html',
  styleUrl: './user-dijalog.component.css'
})
export class UserDijalogComponent implements OnInit {
    @Output() dataChanged = new EventEmitter<void>();
    flag!: number;
    companies!: Company[];
    roles: string[] = ['USER', 'ADMIN', 'SUBADMIN'];
    newPassword!: string;
    allCompanies: Company[] = [];
    assignedCompanyIds: number[] = [];

    constructor(
      public snackBar: MatSnackBar,
      public dialogRef: MatDialogRef<User>,
      @Inject(MAT_DIALOG_DATA) public data: User,
      public service: UserService,
      public companyService: CompanyService
    ) {}

    ngOnInit(): void {
      this.companyService.getAllKompanije().subscribe((companies) => {
        this.allCompanies = companies;

        this.service.getAllUsers().subscribe((users: User[]) => {
          this.assignedCompanyIds = users.map((user: User) => user.company.id);
        });
      });
    }

    public compare(a: any, b: any): boolean {
      return a?.id === b?.id;
    }

    public isCompanyAssigned(company: Company): boolean {
      return this.assignedCompanyIds.includes(company.id);
    }

    public isCurrentCompany(company: Company): boolean {
      return this.data?.company?.id === company.id;
    }

    public onSubmit() {
      if (this.flag === 1) {
        this.add();
      } else if (this.flag === 2) {
        this.update();
      } else if (this.flag === 3) {
        this.delete();
      }
    }

    public add() {
      this.service.addUser(this.data).subscribe(
        () => {
          this.snackBar.open(`Successfully added`, `OK`, { duration: 2500 });
          this.dialogRef.close(1);
        },
        (error: Error) => {
          console.log(error.name + ' ' + error.message);
          this.snackBar.open(`Unsuccessful addition`, `OK`, { duration: 2500 });
        }
      );
    }

    public update() {
      if (this.newPassword) {
        this.data.password = this.newPassword;
      }
      this.service.updateUser(this.data).subscribe(
        () => {
          this.snackBar.open(`Successfully updated`, `OK`, { duration: 2500 });
          this.dialogRef.close(1);
        },
        (error: Error) => {
          console.log(error.name + ' ' + error.message);
          this.snackBar.open(`Unsuccessful update`, `OK`, { duration: 2500 });
        }
      );
    }

    public delete() {
      this.service.deleteUser(this.data.id).subscribe({
        next: () => {
          this.snackBar.open(`Successfully deleted`, `OK`, { duration: 2500 });
          this.dialogRef.close(1);
        },
        error: (error: Error) => {
          console.error('Error while deleting question:', error);
          this.snackBar.open(`Unsuccessful deletion`, `OK`, { duration: 2500 });
        },
      });
    }

    public cancel() {
      this.dialogRef.close();
      this.snackBar.open(`You have canceled the changes`, `OK`, { duration: 2500 });
    }
  }
