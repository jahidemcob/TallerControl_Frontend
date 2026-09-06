import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './user-form.component.css',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  @Input() title = '';
  @Input() buttonLabel = 'Guardar';
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() usuario: any = {};
  @Input() errores: any = {};
  @Output() submitForm = new EventEmitter<NgForm>();

  onSubmit(form: NgForm) {
    this.submitForm.emit(form);
  }
}
