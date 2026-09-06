import { ChangeDetectorRef, inject } from '@angular/core';

export abstract class CreateFormBase<TErrors extends Record<string, any> = Record<string, string>> {
  errores: TErrors = {} as TErrors;
  loading = false;
  successMessage = '';

  protected readonly cdr = inject(ChangeDetectorRef);

  protected beforeSubmit(): boolean {
    if (this.loading) return false;
    this.loading = true;
    this.errores = {} as TErrors;
    this.successMessage = '';
    return true;
  }

  protected handleSuccess(message: string, form: any): void {
    this.successMessage = message;
    form.resetForm();
    this.loading = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  protected handleError(err: any, mapFn: (e: any) => TErrors): void {
    this.errores = mapFn(err);
    this.loading = false;
    this.cdr.detectChanges();
  }
}
