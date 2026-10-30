import { Component, inject, NgZone, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthFacade, AuthErrors } from '../../../../core/services/auth.facade';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, AfterViewInit {
  username: string = '';
  password: string = '';
  errores: AuthErrors = {};
  mensajeGoogle: string = '';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(AuthFacade);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    // Detectar si viene de completar perfil.
    this.route.queryParams.subscribe((params) => {
      if (params['cuentaCreada']) {
        this.mensajeGoogle = 'Cuenta creada correctamente. Por favor inicia sesión.';

        this.cdr.detectChanges();
      }
    });

    // Inicializar autenticación de Google.
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
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  /**
   * Renderiza el botón de Google con el ancho disponible
   * dentro de la tarjeta del login.
   */
  private renderGoogleButton(): void {
    const container = document.getElementById('google-signin-btn');

    if (!container) {
      return;
    }

    // Priorizar el ancho real del contenedor.
    const availableWidth =
      container.clientWidth || container.parentElement?.clientWidth || window.innerWidth - 40;

    // Limitar el ancho para evitar que el botón sobresalga.
    const googleButtonWidth = Math.max(200, Math.min(330, Math.floor(availableWidth)));

    const currentLanguage = this.languageService.getCurrentLanguage();

    const googleLocale = currentLanguage === 'en-US' ? 'en' : 'es';

    // Evitar duplicados si se vuelve a renderizar el botón.
    container.replaceChildren();

    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: googleButtonWidth,
      text: 'continue_with',
      locale: googleLocale,
    });
  }

  login(): void {
    const data = {
      username: this.username,
      clave: this.password,
    };

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
