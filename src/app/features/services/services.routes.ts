import { Routes } from '@angular/router';

// ADMIN
import { CreateServiceComponent } from './pages/admin/create-service/create-service';
import { EditService } from './pages/admin/edit-service/edit-service';
import { ServiceListComponent as AdminServiceList } from './pages/admin/service-list/service-list';
// CLIENT
import { ServiceList as ClientServiceList } from './pages/client/service-list/service-list';

// ADMIN ROUTES
export const ADMIN_SERVICES_ROUTES: Routes = [
  { path: '', component: AdminServiceList },
  { path: 'crear', component: CreateServiceComponent },
  { path: 'editar/:id', component: EditService },
];

// CLIENT ROUTES
export const CLIENT_SERVICES_ROUTES: Routes = [{ path: '', component: ClientServiceList }];
