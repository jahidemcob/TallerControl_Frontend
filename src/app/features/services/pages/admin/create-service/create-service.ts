import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreateService } from '../../../models/service.model';
import { ServicesFacade, BackendErrors } from '../../../services/service.facade';
import { CreateFormBase } from '../../../../../shared/base/create-form.base';
import { ServiceFormComponent } from '../../../../../shared/components/service-form/service-form.component';

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceFormComponent],
  templateUrl: './create-service.html',
  styleUrls: ['./create-service.css'],
})
export class CreateServiceComponent extends CreateFormBase<BackendErrors> {
  service: CreateService = {
    nombreServicio: '',
    descripcion: '',
    precioBase: 0,
  };

  private readonly facade = inject(ServicesFacade);

  createService(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    if (!this.beforeSubmit()) return;

    this.facade.crearServicio(this.service).subscribe({
      next: () => this.handleSuccess('Servicio creado correctamente', form),
      error: (err) => this.handleError(err, this.facade.mapBackendErrors.bind(this.facade)),
    });
  }
}
