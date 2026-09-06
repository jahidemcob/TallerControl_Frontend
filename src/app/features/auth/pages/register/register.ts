import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthFacade, AuthErrors } from '../../../../core/services/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  mensaje: string = ''; 
  mensajeExito: string = '';

  errores: AuthErrors = {};

  campoActivo: string = '';

  private readonly facade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  setCampoActivo(campo: string) {
    this.campoActivo = campo;
  }

  registrar(form: any) {
    this.mensaje = '';
    this.mensajeExito = '';
    this.errores = {};

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensaje = 'Todos los campos deben estar completos correctamente';
      return;
    }

    if (form.value.clave !== form.value.confirmarClave) {
      this.mensaje = 'Las contraseñas no coinciden';
      return;
    }

    const data = {
      Nombre: form.value.nombre,
      NombreUsuario: form.value.usuario,
      Telefono: form.value.telefono,
      Correo: form.value.correo,
      Clave: form.value.clave,
    };

    this.facade.register(data).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario registrado correctamente';
        form.reset();
      },
      error: (err) => {
        this.errores = this.facade.mapRegisterErrors(err);
        this.cdr.detectChanges();
      },
    });
  }
}
