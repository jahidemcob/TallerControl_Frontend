import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  private readonly supportedLanguages = ['es-CO', 'en-US'];

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language');

    const initialLanguage =
      savedLanguage && this.supportedLanguages.includes(savedLanguage) ? savedLanguage : 'es-CO';

    this.setLanguage(initialLanguage);
  }

  setLanguage(language: string): void {
    if (!this.supportedLanguages.includes(language)) {
      return;
    }

    localStorage.setItem('language', language);

    this.translate.use(language);
  }

  getCurrentLanguage(): string {
    return localStorage.getItem('language') ?? 'es-CO';
  }
}
