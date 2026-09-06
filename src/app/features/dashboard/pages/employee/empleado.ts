import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../../core/services/auth'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-empleado',
  imports: [CommonModule, RouterModule], 
  templateUrl: './empleado.html',
  styleUrl: './empleado.css', 
})

export class Empleado {

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
