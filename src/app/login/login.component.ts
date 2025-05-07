import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthService } from '../service/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder, private appComponent: AppComponent) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        sessionStorage.setItem('token', response.token);
        this.decodeToken(response.token);
        this.router.navigate(['/skladiste']);
      },
      error: (error) => {
        console.error('Login failed', error);
        alert('Invalid credentials. Please try again.');
      }
    });
  }


    decodeToken(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);

      const roles = decodedToken.role;
      if (roles && roles.some((role: any) => role.authority === 'ADMIN')) {
        sessionStorage.setItem('role', 'ADMIN');
        sessionStorage.setItem('company', decodedToken.companyId);
      } else if (roles && roles.some((role: any) => role.authority === 'USER')) {
        sessionStorage.setItem('role', 'USER');
        sessionStorage.setItem('company', decodedToken.companyId);
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Invalid credentials. Please try again.');
    }
  }
}
