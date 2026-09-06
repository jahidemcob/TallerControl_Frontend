import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './service-form.component.css',
  templateUrl: './service-form.component.html',
})
export class ServiceFormComponent {
  @Input() title = '';
  @Input() buttonLabel = 'Guardar';
  @Input() service: any = {};
  @Input() errores: any = {};
  @Input() loading = false;
  @Input() successMessage = '';
  @Output() submitForm = new EventEmitter<NgForm>();

  onSubmit(form: NgForm) {
    this.submitForm.emit(form);
  }
}
