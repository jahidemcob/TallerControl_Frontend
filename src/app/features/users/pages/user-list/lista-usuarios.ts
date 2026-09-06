import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioFacade } from '../../services/user.facade';
import { Usuario } from '../../models/user.model';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.css'],
})
export class ListaUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  loadingIds: number[] = [];

  constructor(
    private readonly facade: UsuarioFacade,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.facade.getUsuarios().subscribe({
      next: (users) => {
        this.usuarios = users;

        this.cdr.markForCheck();
      },
      error: (err) => console.error(err),
    });
  }

  crear() {
    this.router.navigate(['/admin/usuarios/crear']);
  }

  editar(id: number) {
    this.router.navigate(['/admin/usuarios/editar', id]);
  }

  toggleEstado(user: Usuario) {
    if (this.loadingIds.includes(user.idUsuario)) return;

    this.loadingIds.push(user.idUsuario);

    this.facade.toggleEstado(user).subscribe({
      next: () => {
        this.cargarUsuarios();

        this.loadingIds = this.loadingIds.filter((i) => i !== user.idUsuario);

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);

        this.loadingIds = this.loadingIds.filter((i) => i !== user.idUsuario);

        this.cdr.markForCheck();
      },
    });
  }

  trackById(_: number, item: Usuario) {
    return item.idUsuario;
  }
}
