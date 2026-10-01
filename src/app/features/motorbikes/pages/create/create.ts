import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreateMotorbike } from '../../models/motorbike.model';
import { MotorbikeFacade, BackendErrors } from '../../services/motorbike.facade';
import { CreateFormBase } from '../../../../shared/base/create-form.base';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class Create extends CreateFormBase<BackendErrors> {
  motorbike: CreateMotorbike = {
    marca: '',
    modelo: '',
    placa: '',
    cilindraje: 0,
    anio: 0,
  };

  private readonly facade = inject(MotorbikeFacade);

  createMotorbike(form: any) {
    if (!this.beforeSubmit()) return;

    this.motorbike.placa = (this.motorbike.placa || '').toUpperCase().replaceAll(' ', '');

    this.facade.crearMotorbike(this.motorbike).subscribe({
      next: () => this.handleSuccess('Motocicleta creada correctamente', form),
      error: (err) => this.handleError(err, this.facade.mapBackendErrors.bind(this.facade)),
    });
  }
}
