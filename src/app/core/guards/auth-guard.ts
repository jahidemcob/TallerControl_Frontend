import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  //  Validar sesión
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  //  Rol desde JWT
  const userRoleRaw = authService.getUserRole();
  const userRole = userRoleRaw ? userRoleRaw.toLowerCase() : null;

  const roleMap: any = {
    administrador: 'admin',
    empleado: 'empleado',
    cliente: 'cliente',
  };

  const rol = userRole ? roleMap[userRole] || userRole : null;

  // Roles permitidos
  const allowedRoles = route.data?.['roles'] as string[];

  // No autorizado
  if (allowedRoles && (!rol || !allowedRoles.includes(rol))) {
    return router.createUrlTree([`/${rol}`]);
  }

  return true;
};
