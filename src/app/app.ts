import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly languageService = inject(LanguageService);

  languageMenuOpen = false;

  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
  }

  selectLanguage(language: string): void {
    this.languageService.setLanguage(language);
    this.languageMenuOpen = false;
  }
}
