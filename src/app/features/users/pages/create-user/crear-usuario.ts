import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UsuarioFacade } from '../../services/user.facade';
import { UsuarioCreate, BackendErrors } from '../../models/user.model';
import { UserFormComponent } from '../../../../shared/components/user-form/user-form.component';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, UserFormComponent],
  templateUrl: './crear-usuario.html',
  styleUrls: ['./crear-usuario.css'],
})
export class CrearUsuario {
  usuario: UsuarioCreate = {
    idRol: 0,
    nombre: '',
    nombreUsuario: '',
    telefono: '',
    correo: '',
    clave: '',
  };

  errores: BackendErrors = {};

  constructor(
    private readonly facade: UsuarioFacade,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  guardar(form: any) {
    this.errores = {};

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.facade.crearUsuario(this.usuario).subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: (err) => {
        this.errores = this.facade.mapBackendErrors(err);
        this.cdr.detectChanges();
      },
    });
  }
}
