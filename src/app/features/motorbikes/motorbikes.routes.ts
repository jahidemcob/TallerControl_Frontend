import { Routes } from '@angular/router';

import { MotorbikeListComponent } from './pages/list/list';
import { Create } from './pages/create/create';
import { Edit } from './pages/edit/edit';

export const MOTORBIKES_ROUTES: Routes = [
  { path: '', component: MotorbikeListComponent },
  { path: 'crear', component: Create }, 
  { path: 'editar/:id', component: Edit } 
];  