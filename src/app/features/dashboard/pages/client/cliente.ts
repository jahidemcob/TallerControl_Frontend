import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth'; 

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css'],
})

export class Cliente {

  menuAbierto: boolean = false;

  constructor(
    private readonly authService: AuthService,
    public router: Router
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