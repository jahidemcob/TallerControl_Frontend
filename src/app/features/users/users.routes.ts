import { Routes } from '@angular/router';

import { ListaUsuarios } from './pages/user-list/lista-usuarios';
import { CrearUsuario } from './pages/create-user/crear-usuario';
import { EditarUsuario } from './pages/edit-user/editar-usuario';

export const USUARIOS_ROUTES: Routes = [
  { path: '', component: ListaUsuarios },
  { path: 'crear', component: CrearUsuario },
  { path: 'editar/:id', component: EditarUsuario } 
];  