import { Component, inject, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthFacade, AuthErrors } from '../../../../core/services/auth.facade';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errores: AuthErrors = {};
  mensajeGoogle: string = '';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(AuthFacade);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Detectar si viene de completar perfil
    this.route.queryParams.subscribe((params) => {
      if (params['cuentaCreada']) {
        this.mensajeGoogle = 'Cuenta creada correctamente. Por favor inicia sesión.';
        this.cdr.detectChanges();
      }
    });

    google.accounts.id.initialize({
      client_id: '542870968155-on5ppmqcj0j6ofmp1f1vnpvk87hdc2jh.apps.googleusercontent.com',
      use_fedcm_for_prompt: false,
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.facade.loginWithGoogle(response.credential).subscribe({
            next: (res: any) => {
              if (res.perfilCompleto === false) {
                this.router.navigate(['/complete-profile']);
              } else {
                localStorage.clear();
                this.mensajeGoogle = 'Tu cuenta ya existe. Por favor inicia sesión.';
                this.cdr.detectChanges();
              }
            },
            error: (err: any) => {
              this.errores = this.facade.mapLoginErrors(err);
              this.cdr.detectChanges();
            },
          });
        });
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-signin-btn'), {
      theme: 'outline',
      size: 'large',
      width: 330,
      text: 'continue_with',
      locale: 'es',
    });
  }

  login() {
    const data = { username: this.username, clave: this.password };
    this.errores = {};
    this.mensajeGoogle = '';

    this.facade.login(data).subscribe({
      next: () => {
        const ruta = this.facade.getRedirectRoute();
        this.router.navigate([`/${ruta}`]);
      },
      error: (err) => {
        this.errores = this.facade.mapLoginErrors(err);
        this.cdr.detectChanges();
      },
    });
  }
}
