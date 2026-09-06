import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
})
export class CompleteProfileComponent {
  error: string = '';
  mensajeExito: string = '';

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  complete(form: NgForm) {
    this.error = '';
    this.mensajeExito = '';

    if (form.invalid) return;

    const { usuario, telefono, clave, confirmarClave } = form.value;

    if (clave !== confirmarClave) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = savedUser?.idUsuario;

    this.http
      .patch(`${environment.apiUrl}/auth/complete-profile`, {
        idUsuario,
        nombreUsuario: usuario,
        telefono,
        clave,
      })
      .subscribe({
        next: () => {
          this.mensajeExito = 'Cuenta completada correctamente. Redirigiendo...';
          localStorage.clear();
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { cuentaCreada: true } });
          }, 2000);
        },
        error: () => {
          this.error = 'Error al completar el perfil. Intenta de nuevo.';
        },
      });
  }
}
