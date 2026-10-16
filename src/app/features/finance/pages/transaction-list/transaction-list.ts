import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FinanceFacade } from '../../services/finance.facade';
import { FinancesSummary, FinanceErrors, Movement } from '../../models/finance.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.css'],
})
export class TransactionList implements OnInit {
  summary: FinancesSummary = {
    movimientos: [],
    total: 0,
  };

  movimientosFiltrados: Movement[] = [];

  loading = false;
  error = '';

  descripcion = '';
  monto: number | null = null;

  tipoSeleccionado: 'Ingreso' | 'Egreso' = 'Ingreso';

  errores: FinanceErrors = {};

  filtroFecha = '';

  constructor(
    private readonly facade: FinanceFacade,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    this.loading = true;

    this.error = '';

    this.facade.getMovimientos().subscribe({
      next: (data) => {
        this.summary = data;

        this.aplicarFiltro();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: () => {
        this.error = 'Error al cargar los movimientos.';

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  aplicarFiltro(): void {
    if (!this.filtroFecha) {
      this.movimientosFiltrados = [...this.summary.movimientos];

      this.cdr.detectChanges();

      return;
    }

    this.movimientosFiltrados = this.summary.movimientos.filter((m: any) => {
      const fechaMov = String(m.fecha).substring(0, 10);

      return fechaMov === this.filtroFecha;
    });

    this.cdr.detectChanges();
  }

  limpiarFecha(): void {
    this.filtroFecha = '';

    this.aplicarFiltro();

    this.cdr.detectChanges();
  }

  get totalFiltrado(): number {
    return this.movimientosFiltrados.reduce((acc, m) => {
      return m.tipoMovimiento === 'Ingreso' ? acc + m.monto : acc - m.monto;
    }, 0);
  }

  submitCon(tipo: 'Ingreso' | 'Egreso', form: any): void {
    this.tipoSeleccionado = tipo;

    this.guardar(form);
  }

  guardar(form: any): void {
    this.errores = {};

    if (form.invalid) {
      form.control.markAllAsTouched();

      this.cdr.detectChanges();

      return;
    }

    this.loading = true;

    this.cdr.detectChanges();

    const accion =
      this.tipoSeleccionado === 'Ingreso'
        ? this.facade.registrarIngreso(this.descripcion, this.monto!)
        : this.facade.registrarEgreso(this.descripcion, this.monto!);

    accion.subscribe({
      next: () => {
        this.descripcion = '';

        this.monto = null;

        form.resetForm();

        this.facade.getMovimientos().subscribe({
          next: (data) => {
            this.summary = data;
            this.aplicarFiltro();
            this.loading = false;
            this.cdr.detectChanges();
          },

          error: () => {
            this.error = 'Error al cargar los movimientos.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },

      error: (err) => {
        this.errores = this.facade.mapBackendErrors(err);

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }
}
