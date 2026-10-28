import { Routes } from '@angular/router';

// ADMIN
import { ManageAppointmentsComponent } from './pages/admin/manage-appointments/manage-appointments';
import { AppointmentInventoryComponent } from '../inventory/pages/appointment-inventory/appointment-inventory';

// EMPLOYEE
import { ScheduledAppointmentsComponent } from './pages/employee/scheduled-appointments/scheduled-appointments';

// CLIENT
import { MyAppointmentsComponent } from './pages/client/my-appointments/my-appointments';
import { RequestAppointmentComponent } from './pages/client/request-appointment/request-appointment';

// ADMIN ROUTES
export const ADMIN_APPOINTMENTS_ROUTES: Routes = [
  {
    path: ':appointmentId/inventario',
    component: AppointmentInventoryComponent,
  },
  {
    path: '',
    component: ManageAppointmentsComponent,
  },
];

// EMPLOYEE ROUTES
export const EMPLOYEE_APPOINTMENTS_ROUTES: Routes = [
  {
    path: ':appointmentId/inventario',
    component: AppointmentInventoryComponent,
  },
  {
    path: '',
    component: ScheduledAppointmentsComponent,
  },
];

// CLIENT ROUTES
export const CLIENT_APPOINTMENTS_ROUTES: Routes = [
  { path: '', component: MyAppointmentsComponent },
  { path: 'solicitar', component: RequestAppointmentComponent },
];
