import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth'; 

@Component({
  selector: 'app-empleado',
  imports: [CommonModule, RouterModule, TranslatePipe], 
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
