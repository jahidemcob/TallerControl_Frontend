import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.css'],
})
export class Administrador {
  menuAbierto: boolean = false;

  constructor(
    private readonly authService: AuthService,
    public router: Router,
  ) {}

  ir(ruta: string) {
    this.router.navigate([ruta]);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
