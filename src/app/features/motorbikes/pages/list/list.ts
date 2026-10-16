import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Motorbike } from '../../models/motorbike.model';
import { MotorbikeFacade } from '../../services/motorbike.facade';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class MotorbikeListComponent implements OnInit {
  motorbikes: Motorbike[] = [];

  private readonly facade = inject(MotorbikeFacade);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadMotorbikes();
  }

  loadMotorbikes() {
    this.facade.getMotorbikes().subscribe({
      next: (data) => {
        this.motorbikes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  trackById(index: number, item: Motorbike) {
    return item.idMoto;
  }

  goToCreate() {
    this.router.navigate(['/cliente/motocicletas/crear']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/cliente/motocicletas/editar', id]);
  }

  toggleStatus(motorbike: Motorbike) {
    this.facade.toggleEstado(motorbike.idMoto).subscribe({
      next: (res) => {
        motorbike.activo = res.status;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
}
