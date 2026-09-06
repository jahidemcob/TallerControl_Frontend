import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsuarioFacade } from '../../services/user.facade';
import { Usuario, UsuarioUpdate, BackendErrors } from '../../models/user.model';
import { UserFormComponent } from '../../../../shared/components/user-form/user-form.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, UserFormComponent],
  templateUrl: './editar-usuario.html',
  styleUrls: ['./editar-usuario.css'],
})
export class EditarUsuario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(UsuarioFacade);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  user!: Usuario & { clave?: string };

  errores: BackendErrors = {};

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.facade.getUsuario(id).subscribe({
      next: (data) => {
        this.user = { ...data, clave: '' };
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err),
    });
  }

  guardar(form: any) {
    this.errores = {};

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!this.user?.idUsuario) return;

    if (this.user.clave && this.user.clave.length > 0 && this.user.clave.length < 6) return;

    const updateData: UsuarioUpdate = {
      ...this.user,
      ...(this.user.clave?.length ? { nuevaClave: this.user.clave } : {}),
    };

    this.facade.actualizarUsuario(this.user.idUsuario, updateData).subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: (err) => {
        this.errores = this.facade.mapBackendErrors(err);
        this.cdr.detectChanges();
      },
    });
  }
}
