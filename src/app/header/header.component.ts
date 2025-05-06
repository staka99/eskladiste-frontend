import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isAdmin: boolean = false;
  menuOpen: boolean = false;
  screenWidth = window.innerWidth;

  constructor(private router: Router, public  authService: AuthService) {
  }

  @HostListener('window:resize', ['$event'])
onResize(event: any) {
  this.screenWidth = event.target.innerWidth;

  if (this.screenWidth > 1024 && this.menuOpen) {
    this.menuOpen = false;
  }
}

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
