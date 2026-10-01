import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UpdateMotorbike } from '../../models/motorbike.model';
import { MotorbikeFacade, BackendErrors } from '../../services/motorbike.facade';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class Edit implements OnInit {
  motorbike: UpdateMotorbike = {
    idMoto: 0,
    marca: '',
    modelo: '',
    cilindraje: 0,
    anio: 0,
  };

  errores: BackendErrors = {};
  loading = false;

  private readonly facade = inject(MotorbikeFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadMotorbike(id);
  }

  loadMotorbike(id: number) {
    this.facade.getMotorbikeById(id).subscribe({
      next: (found) => {
        this.motorbike = {
          idMoto: found.idMoto,
          marca: found.marca,
          modelo: found.modelo,
          cilindraje: found.cilindraje,
          anio: found.anio,
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.errores.general = 'Motocicleta no encontrada';
        this.cdr.detectChanges();
      },
    });
  }

  updateService() {
    if (this.loading) return;

    this.loading = true;
    this.errores = {};

    this.facade.actualizarMotorbike(this.motorbike).subscribe({
      next: () => {
        this.router.navigate(['/cliente/motocicletas']);
      },
      error: (err) => {
        this.errores = this.facade.mapBackendErrors(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
