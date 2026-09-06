import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// 🔥 IMPORTANTE
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),

    // 🔐 Activar HttpClient + Interceptor
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});

